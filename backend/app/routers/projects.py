from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.dependencies import get_current_user

from app.models.project import Project
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
)

from app.services.github_service import (
    get_user_repositories,
)


# ============================================================
# PROJECT ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


# ============================================================
# CREATE PROJECT
# ============================================================

@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    project = Project(
        name=project_data.name,
        description=project_data.description,
        owner_id=current_user.id,
        is_archived=False
    )

    db.add(project)

    db.commit()

    db.refresh(project)

    return project


# ============================================================
# GET ALL PROJECTS
# ============================================================

@router.get(
    "",
    response_model=list[ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    projects = (
        db.query(Project)
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .all()
    )

    return projects


# ============================================================
# GET ONE PROJECT
# ============================================================

@router.get(
    "/{project_id}",
    response_model=ProjectResponse
)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )

    if not project:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


# ============================================================
# CONNECT GITHUB REPOSITORY
# ============================================================

@router.post(
    "/{project_id}/github",
    response_model=ProjectResponse
)
async def connect_github_repository(
    project_id: UUID,
    github_repo_id: int,
    github_owner: str,
    github_repository: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Connect a GitHub repository to an existing Velocyte project.
    """

    # --------------------------------------------------------
    # Find project belonging to current user
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )

    if not project:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # --------------------------------------------------------
    # Make sure GitHub is connected
    # --------------------------------------------------------

    if not current_user.github_access_token:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected"
        )

    # --------------------------------------------------------
    # Fetch repositories available to the logged-in
    # GitHub account
    # --------------------------------------------------------

    result = await get_user_repositories(
        current_user.github_access_token
    )

    # --------------------------------------------------------
    # GitHub API error
    # --------------------------------------------------------

    if not result.get("success"):

        github_status = result.get(
            "status_code",
            502
        )

        if github_status == 401:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "GitHub authorization is invalid "
                    "or expired. Please reconnect GitHub."
                )
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get(
                "message",
                "Failed to fetch GitHub repositories"
            )
        )

    # --------------------------------------------------------
    # Find requested repository
    # --------------------------------------------------------

    repository = next(
        (
            repo
            for repo in result["repositories"]
            if (
                repo["id"] == github_repo_id
                and repo["owner"] == github_owner
                and repo["name"] == github_repository
            )
        ),
        None
    )

    # --------------------------------------------------------
    # Repository does not belong to / isn't accessible by
    # the authenticated GitHub account
    # --------------------------------------------------------

    if not repository:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "The selected GitHub repository is not "
                "accessible by your connected GitHub account."
            )
        )

    # --------------------------------------------------------
    # Save GitHub repository information
    # --------------------------------------------------------

    project.github_repo_id = repository["id"]

    project.github_owner = repository["owner"]

    project.github_repository = repository["name"]

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    db.commit()

    db.refresh(project)

    return project