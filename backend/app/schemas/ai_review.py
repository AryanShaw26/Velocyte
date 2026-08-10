from uuid import UUID

from pydantic import BaseModel, ConfigDict


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

    id: UUID

    # Which Pull Request was reviewed
    pull_request_id: UUID

    # Which project the Pull Request belongs to
    project_id: UUID

    status: str

    score: int | None

    summary: str | None

    # AI-generated code review findings
    findings: list[AIReviewFindingResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )