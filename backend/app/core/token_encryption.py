from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

ENCRYPTION_PREFIX = "fernet:v1:"


def get_fernet() -> Fernet:
    try:
        return Fernet(
            settings.GITHUB_TOKEN_ENCRYPTION_KEY.encode("utf-8")
        )
    except Exception as exc:
        raise RuntimeError(
            "Invalid GitHub token encryption key configuration."
        ) from exc


def is_encrypted_github_token(token: str) -> bool:
    return token.startswith(ENCRYPTION_PREFIX)


def encrypt_github_token(token: str) -> str:
    if not token:
        raise ValueError("GitHub token cannot be empty.")

    encrypted = get_fernet().encrypt(
        token.encode("utf-8")
    ).decode("utf-8")

    return ENCRYPTION_PREFIX + encrypted


def decrypt_github_token(encrypted_token: str) -> str:
    if not encrypted_token:
        raise ValueError("Encrypted GitHub token cannot be empty.")

    if not is_encrypted_github_token(encrypted_token):
        raise ValueError("Token is not in the encrypted format.")

    try:
        encrypted_value = encrypted_token[len(ENCRYPTION_PREFIX):]

        return get_fernet().decrypt(
            encrypted_value.encode("utf-8")
        ).decode("utf-8")

    except InvalidToken as exc:
        raise ValueError(
            "Unable to decrypt GitHub access token."
        ) from exc

    