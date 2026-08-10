from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.dependencies import get_current_user

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse
from uuid import UUID

from fastapi import HTTPException, status

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


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