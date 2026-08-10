from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.dependencies import get_current_user

from app.models.project import Project
from app.models.pull_request import PullRequest
from app.models.ai_review import AIReview
from app.models.ai_review_finding import AIReviewFinding

from app.schemas.pull_request import (
    PullRequestCreate,
    PullRequestUpdate,
    PullRequestResponse,
)


# ============================================================
# PROJECT PULL REQUEST ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/projects",
    tags=["Pull Requests"]
)


# ============================================================
# CREATE PULL REQUEST
# ============================================================

@router.post(
    "/{project_id}/pull-requests",
    response_model=PullRequestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_pull_request(
    project_id: UUID,
    pull_request_data: PullRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Check that the project belongs to the logged-in user
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
    # Create Pull Request
    # --------------------------------------------------------

    pull_request = PullRequest(
        title=pull_request_data.title,
        status=pull_request_data.status,
        project_id=project_id,
        github_pr_number=pull_request_data.github_pr_number
    )

    db.add(pull_request)

    db.commit()

    db.refresh(pull_request)

    return pull_request


# ============================================================
# GET OPEN PULL REQUESTS FOR ONE PROJECT
# ============================================================

@router.get(
    "/{project_id}/pull-requests",
    response_model=list[PullRequestResponse]
)
def get_project_pull_requests(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Verify project ownership
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
    # Get ONLY OPEN Pull Requests
    #
    # Closed and merged PRs remain in the database,
    # but they will not appear in the AI Review selection.
    # --------------------------------------------------------

    pull_requests = (
        db.query(PullRequest)
        .filter(
            PullRequest.project_id == project_id,
            PullRequest.status == "open"
        )
        .order_by(
            PullRequest.id.desc()
        )
        .all()
    )

    return pull_requests


# ============================================================
# UPDATE PULL REQUEST
# ============================================================

@router.patch(
    "/pull-requests/{pull_request_id}",
    response_model=PullRequestResponse
)
def update_pull_request(
    pull_request_id: UUID,
    pull_request_data: PullRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Find Pull Request belonging to user's project
    # --------------------------------------------------------

    pull_request = (
        db.query(PullRequest)
        .join(
            Project,
            PullRequest.project_id == Project.id
        )
        .filter(
            PullRequest.id == pull_request_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )

    if not pull_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pull Request not found"
        )

    # --------------------------------------------------------
    # Get only fields supplied by the frontend
    # --------------------------------------------------------

    update_data = (
        pull_request_data.model_dump(
            exclude_unset=True
        )
    )

    # --------------------------------------------------------
    # Update title
    # --------------------------------------------------------

    if "title" in update_data:
        pull_request.title = update_data["title"]

    # --------------------------------------------------------
    # Update status
    # --------------------------------------------------------

    if "status" in update_data:
        pull_request.status = update_data["status"]

    # --------------------------------------------------------
    # Save changes
    # --------------------------------------------------------

    db.commit()

    db.refresh(pull_request)

    return pull_request


# ============================================================
# DELETE PULL REQUEST
# ============================================================

@router.delete(
    "/pull-requests/{pull_request_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_pull_request(
    pull_request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Find Pull Request and verify ownership
    # --------------------------------------------------------

    pull_request = (
        db.query(PullRequest)
        .join(
            Project,
            PullRequest.project_id == Project.id
        )
        .filter(
            PullRequest.id == pull_request_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )

    if not pull_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pull Request not found"
        )

    # --------------------------------------------------------
    # Delete AI Review Findings first
    #
    # AIReviewFinding -> AIReview
    # --------------------------------------------------------

    ai_review_ids = (
        db.query(AIReview.id)
        .filter(
            AIReview.pull_request_id == pull_request_id
        )
        .all()
    )

    ai_review_ids = [
        review_id
        for (review_id,) in ai_review_ids
    ]

    if ai_review_ids:

        db.query(AIReviewFinding).filter(
            AIReviewFinding.ai_review_id.in_(ai_review_ids)
        ).delete(
            synchronize_session=False
        )

        # ----------------------------------------------------
        # Delete AI Reviews belonging to this Pull Request
        # ----------------------------------------------------

        db.query(AIReview).filter(
            AIReview.id.in_(ai_review_ids)
        ).delete(
            synchronize_session=False
        )

    # --------------------------------------------------------
    # Delete Pull Request
    # --------------------------------------------------------

    db.delete(pull_request)

    db.commit()

    return None


# ============================================================
# GLOBAL PULL REQUEST ROUTER
# ============================================================

global_pull_request_router = APIRouter(
    prefix="/api/pull-requests",
    tags=["Pull Requests"]
)


# ============================================================
# GET ALL USER PULL REQUESTS
# ============================================================

@global_pull_request_router.get(
    "",
    response_model=list[PullRequestResponse]
)
def get_all_pull_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Get PRs belonging to the user's projects
    # --------------------------------------------------------

    pull_requests = (
        db.query(PullRequest)
        .join(
            Project,
            PullRequest.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .order_by(
            PullRequest.id.desc()
        )
        .all()
    )

    return pull_requests