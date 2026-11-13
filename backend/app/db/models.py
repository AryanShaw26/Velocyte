import uuid

from datetime import datetime

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class User(Base):

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    github_id: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
        index=True
    )

    github_username: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    github_access_token: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )


class OAuthAuthorizationCode(Base):

    __tablename__ = "oauth_authorization_codes"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    code_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    purpose: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="login"
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
        server_default=func.now(),
        nullable=False
    )