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
from app.models.pull_request import PullRequest
from app.models.ai_review import AIReview

from app.services.ai_review_service import (
    create_github_ai_review,
)

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
    tags=["AI Reviews"],
)


# ============================================================
# CREATE AI REVIEW MANUALLY
# ============================================================

@router.post(
    "/{project_id}/ai-reviews",
    response_model=AIReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project_ai_review(
    project_id: UUID,
    review_data: AIReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create an AI review record manually for an existing
    local PullRequest.
    """

    # --------------------------------------------------------
    # 1. Verify project ownership
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # 2. Find Pull Request
    # --------------------------------------------------------

    pull_request = (
        db.query(PullRequest)
        .filter(
            PullRequest.id == review_data.pull_request_id,
            PullRequest.project_id == project_id,
        )
        .first()
    )

    if not pull_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pull Request not found for this project",
        )

    # --------------------------------------------------------
    # 3. Create AI Review
    # --------------------------------------------------------

    review = AIReview(
        status=review_data.status,
        score=review_data.score,
        summary=review_data.summary,
        project_id=project_id,
        pull_request_id=review_data.pull_request_id,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


# ============================================================
# RUN AI REVIEW FOR REAL GITHUB PULL REQUEST
# ============================================================

@router.post(
    "/{project_id}/ai-reviews/run/{github_pr_number}",
    response_model=AIReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def run_github_ai_review(
    project_id: UUID,
    github_pr_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run AI review against a real GitHub Pull Request.

    The repository comes from the selected Velocyte project.

    The GitHub access token comes from the authenticated
    Velocyte user's GitHub connection.
    """

    # --------------------------------------------------------
    # 1. Check GitHub connection
    # --------------------------------------------------------

    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected",
        )

    # --------------------------------------------------------
    # 2. Find project
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # 3. Check GitHub repository
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
    # 4. Run AI review
    # --------------------------------------------------------

    result = await create_github_ai_review(
        db=db,
        project=project,
        github_access_token=(
            current_user.github_access_token
        ),
        github_pr_number=github_pr_number,
    )

    # --------------------------------------------------------
    # 5. Handle errors
    # --------------------------------------------------------

    if not result.get("success"):

        result_status = result.get(
            "status_code",
            500,
        )

        if result_status == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "GitHub authorization is invalid "
                    "or expired. Please reconnect GitHub."
                ),
            )

        if result_status == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get(
                    "message",
                    "GitHub Pull Request not found.",
                ),
            )

        if result_status == 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get(
                    "message",
                    "Invalid GitHub review request.",
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get(
                "message",
                "AI review failed.",
            ),
        )

    # --------------------------------------------------------
    # 6. Return AI review
    # --------------------------------------------------------

    return result


# ============================================================
# GET AI REVIEWS FOR ONE PROJECT
# ============================================================

@router.get(
    "/{project_id}/ai-reviews",
    response_model=list[AIReviewResponse],
)
def get_project_ai_reviews(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all AI reviews belonging to one project.
    """

    # --------------------------------------------------------
    # Verify project ownership
    # --------------------------------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # Get reviews
    # --------------------------------------------------------

    reviews = (
        db.query(AIReview)
        .filter(
            AIReview.project_id == project_id,
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
    response_model=AIReviewResponse,
)
def update_ai_review(
    review_id: UUID,
    review_data: AIReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing AI review.
    """

    # --------------------------------------------------------
    # Find review through user's project
    # --------------------------------------------------------

    review = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id,
        )
        .filter(
            AIReview.id == review_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False,
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI Review not found",
        )

    # --------------------------------------------------------
    # Get supplied PATCH fields
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
    # Save
    # --------------------------------------------------------

    db.commit()
    db.refresh(review)

    return review


# ============================================================
# DELETE AI REVIEW
# ============================================================

@router.delete(
    "/ai-reviews/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_ai_review(
    review_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an AI review belonging to the current user.
    """

    # --------------------------------------------------------
    # Find review and verify ownership
    # --------------------------------------------------------

    review = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id,
        )
        .filter(
            AIReview.id == review_id,
            Project.owner_id == current_user.id,
            Project.is_archived == False,
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI Review not found",
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
    tags=["AI Reviews"],
)


# ============================================================
# GET ALL AI REVIEWS FOR CURRENT USER
# ============================================================

@global_ai_review_router.get(
    "",
    response_model=list[AIReviewResponse],
)
def get_all_ai_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all AI reviews belonging to projects owned
    by the current user.
    """

    reviews = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id,
        )
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False,
        )
        .order_by(
            AIReview.id.desc()
        )
        .all()
    )

    return reviews