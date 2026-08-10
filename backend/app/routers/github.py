# ============================================================
# Velocyte - GitHub Router
# ============================================================
#
# These endpoints expose our GitHub integration through
# the Velocyte API.
#
# For this stage, we will test everything through Swagger.
#
# Later, the React UI will call these endpoints.
# ============================================================


# ============================================================
# IMPORTS
# ============================================================

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.db.models import User

from app.services.github_service import (
    test_github_connection,
    get_pull_request,
    get_pull_request_files,
    get_pull_request_review_data,
)


# ============================================================
# ROUTER CONFIGURATION
# ============================================================

router = APIRouter(
    prefix="/api/github",
    tags=["GitHub"],
)


# ============================================================
# TEST GITHUB CONNECTION
# ============================================================

@router.get("/test")
def github_test(
    current_user: User = Depends(get_current_user),
):
    """
    Test the connection between Velocyte and GitHub.

    This verifies that:
    - GITHUB_TOKEN is configured
    - The GitHub repository is accessible
    """

    result = test_github_connection()

    # If GitHub connection failed, return a server error.
    if not result.get("connected"):
        raise HTTPException(
            status_code=500,
            detail=result.get(
                "error",
                "GitHub connection failed.",
            ),
        )

    return result


# ============================================================
# GET PULL REQUEST DETAILS
# ============================================================

@router.get("/pull-requests/{pr_number}")
def github_pull_request(
    pr_number: int,
    current_user: User = Depends(get_current_user),
):
    """
    Fetch basic information about a GitHub Pull Request.

    Example:

        GET /api/github/pull-requests/1
    """

    try:
        return get_pull_request(pr_number)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# GET PULL REQUEST FILES
# ============================================================

@router.get("/pull-requests/{pr_number}/files")
def github_pull_request_files(
    pr_number: int,
    current_user: User = Depends(get_current_user),
):
    """
    Fetch all files changed by a Pull Request.

    Each file can contain:
    - filename
    - status
    - additions
    - deletions
    - total changes
    - GitHub patch/diff

    The patch/diff will later be sent to the AI engine.
    """

    try:
        files = get_pull_request_files(pr_number)

        return {
            "pull_request": pr_number,
            "files": files,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# GET COMPLETE PULL REQUEST REVIEW DATA
# ============================================================

@router.get("/pull-requests/{pr_number}/review-data")
def github_pull_request_review_data(
    pr_number: int,
    current_user: User = Depends(get_current_user),
):
    """
    Fetch everything required for the future AI review.

    Returns:

    - Pull Request information
    - Changed files
    - File status
    - Additions
    - Deletions
    - Code patches/diffs

    This endpoint will eventually provide the input
    that gets passed to the AI review engine.
    """

    try:
        return get_pull_request_review_data(pr_number)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )