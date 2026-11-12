from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings


def get_fernet() -> Fernet:
    """
    Initialize Fernet encryption using the configured key.
    """

    try:
        return Fernet(
            settings.GITHUB_TOKEN_ENCRYPTION_KEY.encode("utf-8")
        )

    except Exception as exc:
        raise RuntimeError(
            "Invalid GitHub token encryption key configuration."
        ) from exc


def encrypt_github_token(token: str) -> str:
    """
    Encrypt a GitHub OAuth access token before database storage.
    """

    if not token:
        raise ValueError("GitHub token cannot be empty.")

    encrypted_token = get_fernet().encrypt(
        token.encode("utf-8")
    )

    return encrypted_token.decode("utf-8")


def decrypt_github_token(encrypted_token: str) -> str:
    """
    Decrypt a GitHub OAuth access token before API usage.
    """

    if not encrypted_token:
        raise ValueError("Encrypted GitHub token cannot be empty.")

    try:
        decrypted_token = get_fernet().decrypt(
            encrypted_token.encode("utf-8")
        )

        return decrypted_token.decode("utf-8")

    except InvalidToken as exc:
        raise ValueError(
            "Unable to decrypt GitHub access token."
        ) from exc

    