from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE TASK SCHEMA
# ============================================================

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "todo"
    assigned_to: UUID | None = None


# ============================================================
# UPDATE TASK SCHEMA
# ============================================================
#
# Every field is optional because PATCH means:
# "update only the fields that were provided."
#
# Example:
#
# {
#     "status": "done"
# }
#
# will change only the status.
#
# ============================================================

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    assigned_to: UUID | None = None


# ============================================================
# TASK RESPONSE SCHEMA
# ============================================================

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: str
    project_id: UUID
    assigned_to: UUID | None

    model_config = ConfigDict(
        from_attributes=True
    )