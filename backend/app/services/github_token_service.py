from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import User

from app.core.token_encryption import (
    encrypt_github_token,
    decrypt_github_token,
    is_encrypted_github_token,
)


def get_github_access_token(
    user: User,
    db: Session
) -> str:
    """
    Retrieve a user's GitHub token.

    - Decrypts encrypted tokens.
    - Automatically encrypts legacy plaintext tokens.
    - Never returns encrypted tokens to GitHub API services.
    """

    stored_token = user.github_access_token

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected."
        )

    try:
        # Already encrypted
        if is_encrypted_github_token(stored_token):
            return decrypt_github_token(stored_token)

        # Legacy plaintext token: encrypt and migrate it
        plaintext_token = stored_token

        user.github_access_token = encrypt_github_token(
            plaintext_token
        )

        db.add(user)
        db.commit()

        return plaintext_token

    except HTTPException:
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve GitHub authorization."
        ) from exc