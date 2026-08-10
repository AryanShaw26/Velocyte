from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.dependencies import get_current_user

from app.models.project import Project
from app.models.task import Task

from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
)


# ============================================================
# PROJECT TASK ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/projects",
    tags=["Tasks"]
)


# ============================================================
# CREATE TASK
# ============================================================

@router.post(
    "/{project_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_task(
    project_id: UUID,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Check project ownership
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
    # Create task
    # --------------------------------------------------------

    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        project_id=project_id,
        assigned_to=task_data.assigned_to
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# ============================================================
# GET TASKS FOR ONE PROJECT
# ============================================================

@router.get(
    "/{project_id}/tasks",
    response_model=list[TaskResponse]
)
def get_project_tasks(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Check project ownership
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
    # Get project tasks
    # --------------------------------------------------------

    tasks = (
        db.query(Task)
        .filter(
            Task.project_id == project_id
        )
        .order_by(Task.id.desc())
        .all()
    )

    return tasks


# ============================================================
# UPDATE TASK
# ============================================================
#
# PATCH /api/tasks/{task_id}
#
# This endpoint allows the frontend to update:
#
# - title
# - description
# - status
# - assigned_to
#
# Only the task owner can update the task.
#
# ============================================================

@router.patch(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Find task and verify project ownership
    # --------------------------------------------------------

    task = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Task.id == task_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )

    # --------------------------------------------------------
    # Task not found
    # --------------------------------------------------------

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------------
    # Get only fields that were actually sent
    #
    # PATCH should not overwrite fields that the user
    # didn't want to change.
    # --------------------------------------------------------

    update_data = task_data.model_dump(
        exclude_unset=True
    )

    # --------------------------------------------------------
    # Update each provided field
    # --------------------------------------------------------

    if "title" in update_data:
        task.title = update_data["title"]

    if "description" in update_data:
        task.description = update_data["description"]

    if "status" in update_data:
        task.status = update_data["status"]

    if "assigned_to" in update_data:
        task.assigned_to = update_data["assigned_to"]

    # --------------------------------------------------------
    # Save changes
    # --------------------------------------------------------

    db.commit()
    db.refresh(task)

    return task


# ============================================================
# DELETE TASK
# ============================================================

@router.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Find task and verify project ownership
    # --------------------------------------------------------

    task = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Task.id == task_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------------
    # Delete task
    # --------------------------------------------------------

    db.delete(task)
    db.commit()

    return None


# ============================================================
# GLOBAL TASK ROUTER
# ============================================================

global_task_router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


# ============================================================
# GET ALL USER TASKS
# ============================================================

@global_task_router.get(
    "",
    response_model=list[TaskResponse]
)
def get_all_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Get all tasks belonging to the user's projects
    # --------------------------------------------------------

    tasks = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .order_by(Task.id.desc())
        .all()
    )

    return tasks