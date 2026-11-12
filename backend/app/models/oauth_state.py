import uuid

from datetime import datetime, timezone

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Index
)

from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class OAuthState(Base):

    __tablename__ = "oauth_states"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    # SHA-256 hash of the random OAuth state
    state_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )

    # NULL for login; populated for account linking
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    # login or account_link
    purpose: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    consumed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        Index(
            "ix_oauth_states_user_purpose",
            "user_id",
            "purpose"
        ),
    )