import uuid

from datetime import datetime, timedelta, timezone

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Index
)

from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class OAuthAuthorizationCode(Base):

    __tablename__ = "oauth_authorization_codes"

    # Unique authorization record ID
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    # SHA-256 hash of the one-time authorization code
    code_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )

    # Associated Velocyte user
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # login or account_link
    purpose: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # Authorization code expiration
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    # Set when the code is successfully exchanged
    consumed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Record creation time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        Index(
            "ix_oauth_codes_user_purpose",
            "user_id",
            "purpose"
        ),
    )