from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ============================================================
# CREATE PROJECT
# ============================================================

class ProjectCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )

    description: str | None = Field(
        default=None,
        max_length=1000
    )


# ============================================================
# PROJECT RESPONSE
# ============================================================

class ProjectResponse(BaseModel):

    # --------------------------------------------------------
    # BASIC PROJECT INFORMATION
    # --------------------------------------------------------

    id: UUID

    name: str

    description: str | None

    owner_id: UUID

    is_archived: bool

    # --------------------------------------------------------
    # GITHUB REPOSITORY
    # --------------------------------------------------------

    github_repo_id: int | None = None

    github_owner: str | None = None

    github_repository: str | None = None

    # --------------------------------------------------------
    # SQLALCHEMY ORM SUPPORT
    # --------------------------------------------------------

    model_config = ConfigDict(
        from_attributes=True
    )