import hashlib
import secrets

from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.oauth_state import OAuthState


OAUTH_STATE_EXPIRY_MINUTES = 10


def hash_oauth_state(state: str) -> str:
    return hashlib.sha256(
        state.encode("utf-8")
    ).hexdigest()


def create_oauth_state(
    db: Session,
    purpose: str,
    user_id: UUID | None = None
) -> str:

    if purpose not in {"login", "account_link"}:
        raise ValueError("Invalid OAuth state purpose.")

    if purpose == "account_link" and user_id is None:
        raise ValueError("User ID is required for account linking.")

    if purpose == "login" and user_id is not None:
        raise ValueError("Login state cannot be bound to a user.")

    raw_state = secrets.token_urlsafe(32)

    oauth_state = OAuthState(
        state_hash=hash_oauth_state(raw_state),
        user_id=user_id,
        purpose=purpose,
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=OAUTH_STATE_EXPIRY_MINUTES)
    )

    db.add(oauth_state)
    db.commit()

    return raw_state


def consume_oauth_state(
    db: Session,
    raw_state: str
) -> tuple[str, UUID | None]:

    if not raw_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing OAuth state."
        )

    try:
        oauth_state = db.execute(
            select(OAuthState)
            .where(
                OAuthState.state_hash == hash_oauth_state(raw_state)
            )
            .with_for_update()
        ).scalar_one_or_none()

        now = datetime.now(timezone.utc)

        if oauth_state is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid OAuth state."
            )

        expires_at = oauth_state.expires_at

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if oauth_state.consumed_at is not None:
            raise HTTPException(
                status_code=400,
                detail="OAuth state has already been used."
            )

        if expires_at <= now:
            raise HTTPException(
                status_code=400,
                detail="OAuth state has expired."
            )

        if oauth_state.purpose not in {"login", "account_link"}:
            raise HTTPException(
                status_code=400,
                detail="Invalid OAuth state purpose."
            )

        if oauth_state.purpose == "login" and oauth_state.user_id is not None:
            raise HTTPException(
                status_code=400,
                detail="Invalid login state."
            )

        if oauth_state.purpose == "account_link" and oauth_state.user_id is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid account-linking state."
            )

        oauth_state.consumed_at = now

        result = (
            oauth_state.purpose,
            oauth_state.user_id
        )

        db.commit()

        return result

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise
