import json

from google import genai

from app.core.config import settings
from app.services.github_service import get_pull_request_review_data
from app.db.database import SessionLocal
from app.models.project import Project
from app.models.pull_request import PullRequest
from app.models.ai_review import AIReview


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# ============================================================
# REVIEW PULL REQUEST WITH GEMINI
# ============================================================

async def review_pull_request(pr_number: int):

    # --------------------------------------------------------
    # Get PR metadata, changed files and patches from GitHub
    # --------------------------------------------------------

    review_data = await get_pull_request_review_data(pr_number)

    if not review_data.get("success"):
        return review_data

    pull_request = review_data["pull_request"]
    files = review_data["files"]

    # --------------------------------------------------------
    # Prepare changed files for Gemini
    # --------------------------------------------------------

    code_changes = []

    for file in files:

        code_changes.append(
            {
                "filename": file.get("filename"),
                "status": file.get("status"),
                "additions": file.get("additions"),
                "deletions": file.get("deletions"),
                "patch": file.get("patch"),
            }
        )

    # --------------------------------------------------------
    # AI REVIEW PROMPT
    # --------------------------------------------------------

    prompt = f"""
You are an expert senior software engineer performing an automated
code review for the Velocyte platform.

Review the following GitHub Pull Request.

PULL REQUEST
------------

Title: {pull_request.get("title")}
Author: {pull_request.get("author")}
Source branch: {pull_request.get("head_branch")}
Target branch: {pull_request.get("base_branch")}

CHANGED FILES
-------------

{json.dumps(code_changes, indent=2)}

Analyze the changes carefully for:

1. Bugs and logical errors
2. Security vulnerabilities
3. Code quality problems
4. Performance problems
5. Maintainability issues

Return ONLY valid JSON in exactly this structure:

{{
    "score": 0,
    "summary": "Overall review of the pull request"
}}

Rules:

- score must be an integer from 0 to 100.
- 90-100 means excellent code.
- 75-89 means good code with minor issues.
- 60-74 means moderate issues.
- 40-59 means significant problems.
- 0-39 means critical problems.
- The summary must mention the most important issues found.
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

        return {
            "success": True,
            "score": result.get("score"),
            "summary": result.get("summary"),
            "pull_request": pull_request,
        }

    except Exception as error:

        return {
            "success": False,
            "message": "AI review failed",
            "error": str(error),
        }


# ============================================================
# CREATE AI REVIEW IN DATABASE
# ============================================================

async def create_ai_review(pr_number: int):

    # --------------------------------------------------------
    # Run Gemini review
    # --------------------------------------------------------

    review_result = await review_pull_request(pr_number)

    if not review_result.get("success"):
        return review_result

    # --------------------------------------------------------
    # Open database session
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Find local PullRequest using GitHub PR number
        # ----------------------------------------------------

        pull_request = (
            db.query(PullRequest)
            .filter(
                PullRequest.github_pr_number == pr_number
            )
            .first()
        )

        if not pull_request:

            return {
                "success": False,
                "message": "Local PullRequest not found",
            }

        # ----------------------------------------------------
        # Create AIReview record
        # ----------------------------------------------------

        ai_review = AIReview(
            status="completed",
            score=review_result.get("score"),
            summary=review_result.get("summary"),
            project_id=pull_request.project_id,
            pull_request_id=pull_request.id,
        )

        # ----------------------------------------------------
        # Save to PostgreSQL
        # ----------------------------------------------------

        db.add(ai_review)

        db.commit()

        db.refresh(ai_review)

        # ----------------------------------------------------
        # Return saved review
        # ----------------------------------------------------

        return {
            "success": True,
            "id": ai_review.id,
            "pull_request_id": str(ai_review.pull_request_id),
            "project_id": str(ai_review.project_id),
            "status": ai_review.status,
            "score": ai_review.score,
            "summary": ai_review.summary,
        }

    except Exception as error:

        db.rollback()

        return {
            "success": False,
            "message": "Failed to save AI review",
            "error": str(error),
        }

    finally:

        db.close()