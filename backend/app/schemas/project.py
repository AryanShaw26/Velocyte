from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


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


class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    owner_id: UUID
    is_archived: bool

    model_config = ConfigDict(
        from_attributes=True
    )