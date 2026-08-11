import uuid

from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Project(Base):

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # ============================================================
    # GITHUB REPOSITORY
    # ============================================================

    github_repo_id: Mapped[int | None] = mapped_column(
        nullable=True,
        index=True
    )

    github_owner: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    github_repository: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )