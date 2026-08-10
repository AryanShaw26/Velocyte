import uuid

from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class AIReviewFinding(Base):

    __tablename__ = "ai_review_findings"

    # ============================================================
    # FINDING ID
    # ============================================================

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    # ============================================================
    # AI REVIEW
    # ============================================================

    ai_review_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ai_reviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # ============================================================
    # SEVERITY
    # ============================================================

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # ============================================================
    # FILE
    # ============================================================

    filename: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    # ============================================================
    # LINE / PATCH REFERENCE
    # ============================================================

    line_reference: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True
    )

    # ============================================================
    # ISSUE
    # ============================================================

    issue: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    # ============================================================
    # EXPLANATION
    # ============================================================

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # ============================================================
    # RECOMMENDATION
    # ============================================================

    recommendation: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # ============================================================
    # AI REVIEW RELATIONSHIP
    # ============================================================

    ai_review: Mapped["AIReview"] = relationship(
        "AIReview",
        back_populates="findings"
    )