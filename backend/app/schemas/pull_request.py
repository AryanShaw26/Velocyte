from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE PULL REQUEST
# ============================================================

class PullRequestCreate(BaseModel):
    """
    Data required when creating a Pull Request.
    """

    title: str

    status: str = "open"
    github_pr_number: int | None = None


# ============================================================
# UPDATE PULL REQUEST
# ============================================================

class PullRequestUpdate(BaseModel):
    """
    Fields that can be changed after creating a Pull Request.

    All fields are optional because we are using PATCH.
    """

    title: str | None = None

    status: str | None = None


# ============================================================
# PULL REQUEST RESPONSE
# ============================================================

class PullRequestResponse(BaseModel):
    """
    Data returned by the API.
    """

    id: UUID

    title: str

    status: str

    project_id: UUID
    github_pr_number: int | None

    model_config = ConfigDict(
        from_attributes=True
    )