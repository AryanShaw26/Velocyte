from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.db.models import User
from app.models.project import Project
from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.services.github_service import (
    test_github_connection,
    get_user_repositories,
    get_repository_pull_requests,
    get_repository_pull_request,
    get_repository_pull_request_files,
    get_repository_pull_request_diff,
    merge_repository_pull_request,
    close_repository_pull_request,
)


# ============================================================
# GITHUB ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/github",
    tags=["GitHub"],
)


# ============================================================
# TEST GITHUB CONNECTION
# ============================================================

@router.get("/test")
async def test_connection():
    return await test_github_connection()


# ============================================================
# GET LOGGED-IN USER'S GITHUB REPOSITORIES
# ============================================================

@router.get("/repositories")
async def get_github_repositories(
    current_user: User = Depends(get_current_user),
):
    """
    Fetch repositories accessible to the GitHub account
    connected to the current Velocyte user.
    """

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    result = await get_user_repositories(
        current_user.github_access_token
    )

    if not result.get("success"):

        github_status = result.get(
            "status_code",
            502,
        )

        if github_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "GitHub authorization is invalid "
                    "or expired. Please reconnect GitHub."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to fetch GitHub repositories",
            ),
        )

    return result


# ============================================================
# GET REAL GITHUB PULL REQUESTS FOR A VELOCYTE PROJECT
# ============================================================

@router.get(
    "/projects/{project_id}/pull-requests"
)
async def get_project_github_pull_requests(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch all real GitHub Pull Requests for the
    repository connected to a Velocyte project.
    """

    # --------------------------------------------------------
    # Check GitHub connection
    # --------------------------------------------------------

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    # --------------------------------------------------------
    # Find project owned by current user
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # Check repository connection
    # --------------------------------------------------------

    if (
        not project.github_owner
        or not project.github_repository
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This project is not connected "
                "to a GitHub repository."
            ),
        )

    # --------------------------------------------------------
    # Fetch PRs from GitHub
    # --------------------------------------------------------

    result = await get_repository_pull_requests(
        github_access_token=(
            current_user.github_access_token
        ),
        github_owner=project.github_owner,
        github_repository=project.github_repository,
    )

    # --------------------------------------------------------
    # Handle GitHub errors
    # --------------------------------------------------------

    if not result.get("success"):

        github_status = result.get(
            "status_code",
            502,
        )

        if github_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "GitHub authorization is invalid "
                    "or expired. Please reconnect GitHub."
                ),
            )

        if github_status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "The connected GitHub repository "
                    "could not be found or accessed."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to fetch GitHub Pull Requests.",
            ),
        )

    return result


# ============================================================
# GET ONE REAL GITHUB PULL REQUEST
# ============================================================

@router.get(
    "/projects/{project_id}/pull-requests/{pr_number}"
)
async def get_project_github_pull_request(
    project_id: str,
    pr_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch one specific GitHub Pull Request
    belonging to the project's connected repository.
    """

    # --------------------------------------------------------
    # Check GitHub connection
    # --------------------------------------------------------

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    # --------------------------------------------------------
    # Find project owned by current user
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # Check repository connection
    # --------------------------------------------------------

    if (
        not project.github_owner
        or not project.github_repository
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This project is not connected "
                "to a GitHub repository."
            ),
        )

    # --------------------------------------------------------
    # Fetch PR from GitHub
    # --------------------------------------------------------

    result = await get_repository_pull_request(
        github_access_token=(
            current_user.github_access_token
        ),
        github_owner=project.github_owner,
        github_repository=project.github_repository,
        pr_number=pr_number,
    )

    # --------------------------------------------------------
    # Handle GitHub errors
    # --------------------------------------------------------

    if not result.get("success"):

        github_status = result.get(
            "status_code",
            502,
        )

        if github_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "GitHub authorization is invalid "
                    "or expired. Please reconnect GitHub."
                ),
            )

        if github_status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "GitHub Pull Request was not found."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to fetch GitHub Pull Request.",
            ),
        )

    return result


# ============================================================
# GET FILES CHANGED IN A GITHUB PULL REQUEST
# ============================================================

@router.get(
    "/projects/{project_id}/pull-requests/{pr_number}/files"
)
async def get_project_github_pull_request_files(
    project_id: str,
    pr_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch all files changed by a specific GitHub Pull Request.
    """

    # --------------------------------------------------------
    # Check GitHub connection
    # --------------------------------------------------------

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    # --------------------------------------------------------
    # Find project owned by current user
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # Check repository connection
    # --------------------------------------------------------

    if (
        not project.github_owner
        or not project.github_repository
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This project is not connected "
                "to a GitHub repository."
            ),
        )

    # --------------------------------------------------------
    # Fetch changed files
    # --------------------------------------------------------

    result = await get_repository_pull_request_files(
        github_access_token=(
            current_user.github_access_token
        ),
        github_owner=project.github_owner,
        github_repository=project.github_repository,
        pr_number=pr_number,
    )

    # --------------------------------------------------------
    # Handle GitHub errors
    # --------------------------------------------------------

    if not result.get("success"):

        github_status = result.get(
            "status_code",
            502,
        )

        if github_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "GitHub authorization is invalid "
                    "or expired. Please reconnect GitHub."
                ),
            )

        if github_status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "GitHub Pull Request was not found."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to fetch changed files.",
            ),
        )

    return result


# ============================================================
# GET ACTUAL CODE DIFF FOR A GITHUB PULL REQUEST
# ============================================================

@router.get(
    "/projects/{project_id}/pull-requests/{pr_number}/diff"
)
async def get_project_github_pull_request_diff(
    project_id: str,
    pr_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch the actual code diff for a GitHub Pull Request.
    """

    # --------------------------------------------------------
    # Check GitHub connection
    # --------------------------------------------------------

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    # --------------------------------------------------------
    # Find project owned by current user
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # Check repository connection
    # --------------------------------------------------------

    if (
        not project.github_owner
        or not project.github_repository
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This project is not connected "
                "to a GitHub repository."
            ),
        )

    # --------------------------------------------------------
    # Fetch actual diff
    # --------------------------------------------------------

    result = await get_repository_pull_request_diff(
        github_access_token=(
            current_user.github_access_token
        ),
        github_owner=project.github_owner,
        github_repository=project.github_repository,
        pr_number=pr_number,
    )

    # --------------------------------------------------------
    # Handle GitHub errors
    # --------------------------------------------------------

    if not result.get("success"):

        github_status = result.get(
            "status_code",
            502,
        )

        if github_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "GitHub authorization is invalid "
                    "or expired. Please reconnect GitHub."
                ),
            )

        if github_status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "GitHub Pull Request was not found."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to fetch pull request diff.",
            ),
        )

    return result

# ============================================================
# MERGE A REAL GITHUB PULL REQUEST
# ============================================================

@router.post(
    "/projects/{project_id}/pull-requests/{pr_number}/merge"
)
async def merge_project_github_pull_request(
    project_id: str,
    pr_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Merge a real GitHub Pull Request from Velocyte.

    GitHub performs the actual merge into the PR's configured
    base branch. Velocyte does not change the PR status locally.
    """

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if not project.github_owner or not project.github_repository:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This project is not connected "
                "to a GitHub repository."
            ),
        )

    result = await merge_repository_pull_request(
        github_access_token=current_user.github_access_token,
        github_owner=project.github_owner,
        github_repository=project.github_repository,
        pr_number=pr_number,
        merge_method="merge",
    )

    if not result.get("success"):
        github_status = result.get("status_code", 502)

        if github_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.get("message"),
            )

        if github_status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("message"),
            )

        if github_status in {405, 409}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=result.get("message"),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to merge GitHub Pull Request.",
            ),
        )

    return result


# ============================================================
# CLOSE A REAL GITHUB PULL REQUEST
# ============================================================

@router.post(
    "/projects/{project_id}/pull-requests/{pr_number}/close"
)
async def close_project_github_pull_request(
    project_id: str,
    pr_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Close a real GitHub Pull Request without merging it.
    """

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if not project.github_owner or not project.github_repository:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This project is not connected "
                "to a GitHub repository."
            ),
        )

    result = await close_repository_pull_request(
        github_access_token=current_user.github_access_token,
        github_owner=project.github_owner,
        github_repository=project.github_repository,
        pr_number=pr_number,
    )

    if not result.get("success"):
        github_status = result.get("status_code", 502)

        if github_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.get("message"),
            )

        if github_status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("message"),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to close GitHub Pull Request.",
            ),
        )

    return result