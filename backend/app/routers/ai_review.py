from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.dependencies import get_current_user

from app.models.project import Project
from app.models.pull_request import PullRequest
from app.models.ai_review import AIReview

from app.schemas.ai_review import (
    AIReviewCreate,
    AIReviewUpdate,
    AIReviewResponse,
)


# ============================================================
# PROJECT AI REVIEW ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/projects",
    tags=["AI Reviews"]
)


# ============================================================
# CREATE AI REVIEW
# ============================================================

@router.post(
    "/{project_id}/ai-reviews",
    response_model=AIReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def create_ai_review(
    project_id: UUID,
    review_data: AIReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # 1. Verify that the project belongs to current user
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
    # 2. Find the Pull Request
    # --------------------------------------------------------

    pull_request = (
        db.query(PullRequest)
        .filter(
            PullRequest.id == review_data.pull_request_id,
            PullRequest.project_id == project_id
        )
        .first()
    )


    if not pull_request:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pull Request not found for this project"
        )


    # --------------------------------------------------------
    # 3. Create AI Review
    # --------------------------------------------------------

    review = AIReview(

        status=review_data.status,

        score=review_data.score,

        summary=review_data.summary,

        project_id=project_id,

        pull_request_id=review_data.pull_request_id

    )


    db.add(review)

    db.commit()

    db.refresh(review)


    return review


# ============================================================
# GET AI REVIEWS FOR ONE PROJECT
# ============================================================

@router.get(
    "/{project_id}/ai-reviews",
    response_model=list[AIReviewResponse]
)
def get_project_ai_reviews(
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
    # Get all AI reviews for this project
    # --------------------------------------------------------

    reviews = (
        db.query(AIReview)
        .filter(
            AIReview.project_id == project_id
        )
        .order_by(
            AIReview.id.desc()
        )
        .all()
    )


    return reviews


# ============================================================
# UPDATE AI REVIEW
# ============================================================

@router.patch(
    "/ai-reviews/{review_id}",
    response_model=AIReviewResponse
)
def update_ai_review(
    review_id: UUID,
    review_data: AIReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Find review through the user's project
    # --------------------------------------------------------

    review = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            AIReview.id == review_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )


    if not review:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI Review not found"
        )


    # --------------------------------------------------------
    # Get only supplied PATCH fields
    # --------------------------------------------------------

    update_data = review_data.model_dump(
        exclude_unset=True
    )


    # --------------------------------------------------------
    # Update status
    # --------------------------------------------------------

    if "status" in update_data:

        review.status = update_data["status"]


    # --------------------------------------------------------
    # Update score
    # --------------------------------------------------------

    if "score" in update_data:

        review.score = update_data["score"]


    # --------------------------------------------------------
    # Update summary
    # --------------------------------------------------------

    if "summary" in update_data:

        review.summary = update_data["summary"]


    # --------------------------------------------------------
    # Save changes
    # --------------------------------------------------------

    db.commit()

    db.refresh(review)


    return review


# ============================================================
# DELETE AI REVIEW
# ============================================================

@router.delete(
    "/ai-reviews/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_ai_review(
    review_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Find review and verify ownership
    # --------------------------------------------------------

    review = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            AIReview.id == review_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .first()
    )


    if not review:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI Review not found"
        )


    # --------------------------------------------------------
    # Delete review
    # --------------------------------------------------------

    db.delete(review)

    db.commit()


    return None


# ============================================================
# GLOBAL AI REVIEW ROUTER
# ============================================================

global_ai_review_router = APIRouter(
    prefix="/api/ai-reviews",
    tags=["AI Reviews"]
)


# ============================================================
# GET ALL AI REVIEWS FOR CURRENT USER
# ============================================================

@global_ai_review_router.get(
    "",
    response_model=list[AIReviewResponse]
)
def get_all_ai_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Get reviews belonging to user's projects
    # --------------------------------------------------------

    reviews = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .order_by(
            AIReview.id.desc()
        )
        .all()
    )


    return reviews