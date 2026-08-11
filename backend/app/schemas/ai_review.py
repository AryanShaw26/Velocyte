from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# AI REVIEW FINDING RESPONSE
# ============================================================

class AIReviewFindingResponse(BaseModel):
    """
    A single issue identified by the AI code review.
    """

    id: UUID

    ai_review_id: UUID

    severity: str

    filename: str | None = None

    line_reference: str | None = None

    issue: str

    explanation: str

    recommendation: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# CREATE AI REVIEW
# ============================================================

class AIReviewCreate(BaseModel):
    """
    Data required when creating an AI review.
    """

    pull_request_id: UUID

    status: str = "completed"

    score: int | None = None

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

    # ========================================================
    # REVIEW ID
    # ========================================================

    id: UUID

    # ========================================================
    # PULL REQUEST
    # ========================================================

    pull_request_id: UUID

    # ========================================================
    # PROJECT
    # ========================================================

    project_id: UUID

    # ========================================================
    # REVIEW STATUS
    # ========================================================

    status: str

    # ========================================================
    # AI SCORE
    # ========================================================

    score: int | None = None

    # ========================================================
    # AI SUMMARY
    # ========================================================

    summary: str | None = None

    # ========================================================
    # REVIEW DATE
    # ========================================================

    created_at: datetime

    # ========================================================
    # AI FINDINGS
    # ========================================================

    findings: list[AIReviewFindingResponse] = Field(
        default_factory=list
    )

    # ========================================================
    # SQLAlchemy ORM SUPPORT
    # ========================================================

    model_config = ConfigDict(
        from_attributes=True
    )