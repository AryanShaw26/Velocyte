import json

from google import genai

from app.core.config import settings

from app.models.pull_request import PullRequest
from app.models.ai_review import AIReview
from app.models.ai_review_finding import AIReviewFinding

from app.services.github_service import (
    get_repository_pull_request,
    get_repository_pull_request_files,
)


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# ============================================================
# REVIEW GITHUB PULL REQUEST WITH GEMINI
# ============================================================

async def review_github_pull_request(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
    pr_number: int,
):
    """
    Fetch a real GitHub Pull Request and its changed files,
    then send the changes to Gemini for AI code review.
    """

    # --------------------------------------------------------
    # FETCH PR DETAILS
    # --------------------------------------------------------

    pr_result = await get_repository_pull_request(
        github_access_token=github_access_token,
        github_owner=github_owner,
        github_repository=github_repository,
        pr_number=pr_number,
    )

    if not pr_result.get("success"):
        return pr_result

    # --------------------------------------------------------
    # FETCH CHANGED FILES
    # --------------------------------------------------------

    files_result = await get_repository_pull_request_files(
        github_access_token=github_access_token,
        github_owner=github_owner,
        github_repository=github_repository,
        pr_number=pr_number,
    )

    if not files_result.get("success"):
        return files_result

    pull_request = pr_result["pull_request"]
    files = files_result.get("files", [])

    # --------------------------------------------------------
    # PREPARE CODE CHANGES
    # --------------------------------------------------------

    code_changes = []

    for file in files:

        code_changes.append(
            {
                "filename": file.get("filename"),
                "status": file.get("status"),
                "additions": file.get("additions"),
                "deletions": file.get("deletions"),
                "changes": file.get("changes"),
                "patch": file.get("patch"),
            }
        )

    # --------------------------------------------------------
    # AI REVIEW PROMPT
    # --------------------------------------------------------

    prompt = f"""
You are an expert senior software engineer performing an
automated code review for the Velocyte platform.

Review the following real GitHub Pull Request.

PULL REQUEST
------------

Number: {pull_request.get("number")}
Title: {pull_request.get("title")}
Author: {pull_request.get("author")}
Source branch: {pull_request.get("head_branch")}
Target branch: {pull_request.get("base_branch")}

Description:
{pull_request.get("body")}

CHANGED FILES
-------------

{json.dumps(code_changes, indent=2)}

Analyze the code changes carefully for:

1. Bugs and logical errors
2. Security vulnerabilities
3. Code quality problems
4. Performance problems
5. Maintainability issues
6. Bad practices
7. Missing error handling
8. Potential edge cases

IMPORTANT:

Only identify issues that are actually supported by the
provided code changes.

Do not invent issues.

Return ONLY valid JSON in exactly this structure:

{{
    "score": 0,
    "summary": "Overall review of the pull request",
    "findings": [
        {{
            "severity": "high",
            "filename": "path/to/file.py",
            "line_reference": "optional line or patch reference",
            "issue": "Short description of the issue",
            "explanation": "Detailed technical explanation",
            "recommendation": "Practical recommendation to fix it"
        }}
    ]
}}

RULES:

- score must be an integer from 0 to 100.
- 90-100 means excellent code.
- 75-89 means good code with minor issues.
- 60-74 means moderate issues.
- 40-59 means significant problems.
- 0-39 means critical problems.

- findings must always be an array.

- severity must be one of:
  "critical"
  "high"
  "medium"
  "low"

- filename must match one of the changed files when
  the finding is related to a specific file.

- line_reference may be null when an exact line cannot
  be determined from the patch.

- issue must be concise.

- explanation must clearly describe the technical problem.

- recommendation must provide a practical fix.

- Do not report imaginary problems.

- Do not use Markdown.

- Do not return anything outside the JSON object.
"""

    # --------------------------------------------------------
    # CALL GEMINI
    # --------------------------------------------------------

    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
            },
        )

        result = json.loads(response.text)

    except Exception as error:

        return {
            "success": False,
            "status_code": 500,
            "message": "AI review failed",
            "error": str(error),
        }

    # --------------------------------------------------------
    # VALIDATE SCORE
    # --------------------------------------------------------

    score = result.get("score")

    if not isinstance(score, int):

        return {
            "success": False,
            "status_code": 500,
            "message": "Gemini returned an invalid score.",
        }

    if not 0 <= score <= 100:

        return {
            "success": False,
            "status_code": 500,
            "message": "Gemini returned a score outside 0-100.",
        }

    # --------------------------------------------------------
    # VALIDATE SUMMARY
    # --------------------------------------------------------

    summary = result.get("summary")

    if not isinstance(summary, str):

        return {
            "success": False,
            "status_code": 500,
            "message": "Gemini returned an invalid summary.",
        }

    # --------------------------------------------------------
    # VALIDATE FINDINGS
    # --------------------------------------------------------

    findings = result.get("findings", [])

    if not isinstance(findings, list):

        return {
            "success": False,
            "status_code": 500,
            "message": "Gemini returned invalid findings.",
        }

    normalized_findings = []

    for finding in findings:

        if not isinstance(finding, dict):
            continue

        severity = finding.get(
            "severity",
            "medium",
        )

        if severity not in {
            "critical",
            "high",
            "medium",
            "low",
        }:
            severity = "medium"

        normalized_findings.append(
            {
                "severity": severity,
                "filename": finding.get("filename"),
                "line_reference": finding.get(
                    "line_reference"
                ),
                "issue": finding.get(
                    "issue",
                    "",
                ),
                "explanation": finding.get(
                    "explanation",
                    "",
                ),
                "recommendation": finding.get(
                    "recommendation",
                    "",
                ),
            }
        )

    # --------------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------------

    return {
        "success": True,
        "score": score,
        "summary": summary,
        "findings": normalized_findings,
        "pull_request": pull_request,
        "files": files,
    }


# ============================================================
# SAVE AI REVIEW TO DATABASE
# ============================================================

async def create_github_ai_review(
    db,
    project,
    github_access_token: str,
    github_pr_number: int,
):
    """
    Run AI review for a real GitHub Pull Request and save
    the review + findings into PostgreSQL.
    """

    # --------------------------------------------------------
    # CHECK PROJECT GITHUB CONNECTION
    # --------------------------------------------------------

    if (
        not project.github_owner
        or not project.github_repository
    ):

        return {
            "success": False,
            "status_code": 400,
            "message": (
                "This project is not connected "
                "to a GitHub repository."
            ),
        }

    # --------------------------------------------------------
    # RUN GEMINI REVIEW
    # --------------------------------------------------------

    review_result = await review_github_pull_request(
        github_access_token=github_access_token,
        github_owner=project.github_owner,
        github_repository=project.github_repository,
        pr_number=github_pr_number,
    )

    if not review_result.get("success"):
        return review_result

    github_pr = review_result["pull_request"]

    # --------------------------------------------------------
    # FIND LOCAL PULL REQUEST
    #
    # IMPORTANT:
    # If the GitHub PR has never been stored locally,
    # create the local record automatically.
    # --------------------------------------------------------

    pull_request = (
        db.query(PullRequest)
        .filter(
            PullRequest.project_id == project.id,
            PullRequest.github_pr_number == github_pr_number,
        )
        .first()
    )

    # --------------------------------------------------------
    # CREATE LOCAL PR IF IT DOES NOT EXIST
    # --------------------------------------------------------

    if not pull_request:

        pull_request = PullRequest(
            title=github_pr.get(
                "title",
                f"GitHub PR #{github_pr_number}",
            ),
            status=(
                "merged"
                if github_pr.get("merged")
                else github_pr.get(
                    "state",
                    "open",
                )
            ),
            project_id=project.id,
            github_pr_number=github_pr_number,
        )

        db.add(pull_request)

        db.flush()

    # --------------------------------------------------------
    # UPDATE LOCAL PR INFORMATION
    # --------------------------------------------------------

    else:

        pull_request.title = github_pr.get(
            "title",
            pull_request.title,
        )

        if github_pr.get("merged"):

            pull_request.status = "merged"

        else:

            pull_request.status = github_pr.get(
                "state",
                pull_request.status,
            )

    # --------------------------------------------------------
    # CREATE AI REVIEW
    # --------------------------------------------------------

    ai_review = AIReview(
        status="completed",
        score=review_result.get("score"),
        summary=review_result.get("summary"),
        project_id=project.id,
        pull_request_id=pull_request.id,
    )

    db.add(ai_review)

    # Flush so AIReview ID is available
    db.flush()

    # --------------------------------------------------------
    # CREATE FINDINGS
    # --------------------------------------------------------

    saved_findings = []

    for finding in review_result.get(
        "findings",
        [],
    ):

        ai_review_finding = AIReviewFinding(
            ai_review_id=ai_review.id,
            severity=finding.get(
                "severity",
                "medium",
            ),
            filename=finding.get(
                "filename"
            ),
            line_reference=finding.get(
                "line_reference"
            ),
            issue=finding.get(
                "issue",
                "",
            ),
            explanation=finding.get(
                "explanation",
                "",
            ),
            recommendation=finding.get(
                "recommendation",
                "",
            ),
        )

        db.add(ai_review_finding)

        saved_findings.append(
            ai_review_finding
        )

    # --------------------------------------------------------
    # SAVE EVERYTHING
    # --------------------------------------------------------

    try:

        db.commit()

        db.refresh(ai_review)

        for finding in saved_findings:
            db.refresh(finding)

    except Exception as error:

        db.rollback()

        return {
            "success": False,
            "status_code": 500,
            "message": "Failed to save AI review.",
            "error": str(error),
        }

    # --------------------------------------------------------
    # RETURN COMPLETE REVIEW
    # --------------------------------------------------------

    return {
        "success": True,
        "id": ai_review.id,
        "pull_request_id": ai_review.pull_request_id,
        "project_id": ai_review.project_id,
        "status": ai_review.status,
        "score": ai_review.score,
        "summary": ai_review.summary,
        "created_at": ai_review.created_at,
        "findings": [
            {
                "id": finding.id,
                "ai_review_id": finding.ai_review_id,
                "severity": finding.severity,
                "filename": finding.filename,
                "line_reference": finding.line_reference,
                "issue": finding.issue,
                "explanation": finding.explanation,
                "recommendation": finding.recommendation,
            }
            for finding in saved_findings
        ],
    }