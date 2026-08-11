import uuid

from datetime import datetime

from sqlalchemy import (
    String,
    Text,
    ForeignKey,
    DateTime,
    func,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.database import Base


class AIReview(Base):

    __tablename__ = "ai_reviews"

    # ============================================================
    # AI REVIEW ID
    # ============================================================

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    # ============================================================
    # REVIEW STATUS
    # ============================================================

    status: Mapped[str] = mapped_column(
        String(50),
        default="completed",
        nullable=False
    )

    # ============================================================
    # AI SCORE
    # ============================================================

    score: Mapped[int | None] = mapped_column(
        nullable=True
    )

    # ============================================================
    # AI SUMMARY
    # ============================================================

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # ============================================================
    # PROJECT
    # ============================================================

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True
    )

    # ============================================================
    # PULL REQUEST
    # ============================================================

    pull_request_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("pull_requests.id"),
        nullable=False,
        index=True
    )

    # ============================================================
    # REVIEW CREATED AT
    # ============================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # ============================================================
    # AI REVIEW FINDINGS
    # ============================================================

    findings: Mapped[list["AIReviewFinding"]] = relationship(
        "AIReviewFinding",
        back_populates="ai_review",
        cascade="all, delete-orphan"
    )