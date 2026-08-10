from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE AI REVIEW
# ============================================================

class AIReviewCreate(BaseModel):
    """
    Data required when creating an AI review.
    """

    # Pull Request that this review belongs to
    pull_request_id: UUID

    # Review status
    status: str = "completed"

    # AI-generated score
    score: int | None = None

    # AI-generated summary
    summary: str | None = None


# ============================================================
# UPDATE AI REVIEW
# ============================================================

class AIReviewUpdate(BaseModel):
    """
    Fields that can be updated after an AI review exists.
    """

    status: str | None = None

    score: int | None = None

    summary: str | None = None


# ============================================================
# AI REVIEW RESPONSE
# ============================================================

class AIReviewResponse(BaseModel):
    """
    Data returned from the API to the frontend.
    """

    id: UUID

    # Which Pull Request was reviewed
    pull_request_id: UUID

    # Which project the Pull Request belongs to
    project_id: UUID

    status: str

    score: int | None

    summary: str | None

    model_config = ConfigDict(
        from_attributes=True
    )