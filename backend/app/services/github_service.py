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

async def get_pull_requests():
    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = f"{GITHUB_API_URL}/repos/{settings.GITHUB_REPOSITORY}/pulls"

    params = {
        "state": "open",
        "sort": "updated",
        "direction": "desc",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=headers,
            params=params,
        )

    if response.status_code != 200:
        return {
            "success": False,
            "status_code": response.status_code,
            "message": "Failed to fetch pull requests",
        }

    pull_requests = response.json()

    return {
        "success": True,
        "count": len(pull_requests),
        "pull_requests": [
            {
                "number": pr.get("number"),
                "title": pr.get("title"),
                "state": pr.get("state"),
                "user": pr.get("user", {}).get("login"),
                "html_url": pr.get("html_url"),
                "created_at": pr.get("created_at"),
                "updated_at": pr.get("updated_at"),
                "head": pr.get("head", {}).get("ref"),
                "base": pr.get("base", {}).get("ref"),
            }
            for pr in pull_requests
        ],
    }

async def get_pull_request(pr_number: int):
    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{settings.GITHUB_REPOSITORY}/pulls/{pr_number}"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=headers,
        )

    if response.status_code != 200:
        return {
            "success": False,
            "status_code": response.status_code,
            "message": "Failed to fetch pull request",
        }

    pr = response.json()

    return {
        "success": True,
        "pull_request": {
            "number": pr.get("number"),
            "title": pr.get("title"),
            "body": pr.get("body"),
            "state": pr.get("state"),
            "author": pr.get("user", {}).get("login"),
            "html_url": pr.get("html_url"),
            "head_branch": pr.get("head", {}).get("ref"),
            "base_branch": pr.get("base", {}).get("ref"),
            "created_at": pr.get("created_at"),
            "updated_at": pr.get("updated_at"),
            "merged": pr.get("merged"),
            "additions": pr.get("additions"),
            "deletions": pr.get("deletions"),
            "changed_files": pr.get("changed_files"),
        },
    }

async def get_pull_request_files(pr_number: int):
    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{settings.GITHUB_REPOSITORY}/pulls/{pr_number}/files"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=headers,
        )

    if response.status_code != 200:
        return {
            "success": False,
            "status_code": response.status_code,
            "message": "Failed to fetch pull request files",
        }

    files = response.json()

    return {
        "success": True,
        "count": len(files),
        "files": [
            {
                "filename": file.get("filename"),
                "status": file.get("status"),
                "additions": file.get("additions"),
                "deletions": file.get("deletions"),
                "changes": file.get("changes"),
                "patch": file.get("patch"),
                "raw_url": file.get("raw_url"),
                "blob_url": file.get("blob_url"),
            }
            for file in files
        ],
    }