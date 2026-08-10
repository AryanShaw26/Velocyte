import httpx

from app.core.config import settings


GITHUB_API_URL = "https://api.github.com"


async def test_github_connection():
    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/user",
            headers=headers,
        )

    if response.status_code != 200:
        return {
            "connected": False,
            "status_code": response.status_code,
            "message": "GitHub authentication failed",
        }

    user = response.json()

    return {
        "connected": True,
        "username": user.get("login"),
        "name": user.get("name"),
        "message": "GitHub connection successful",
    }