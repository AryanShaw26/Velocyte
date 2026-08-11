import httpx

from app.core.config import settings


GITHUB_API_URL = "https://api.github.com"


# ============================================================
# TEST GITHUB CONNECTION
# ============================================================

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


# ============================================================
# OLD / LEGACY GET PULL REQUESTS
# ============================================================

async def get_pull_requests():

    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{settings.GITHUB_REPOSITORY}/pulls"
    )

    params = {
        "state": "all",
        "sort": "updated",
        "direction": "desc",
        "per_page": 100,
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
                "user": pr.get(
                    "user", {}
                ).get("login"),
                "html_url": pr.get("html_url"),
                "created_at": pr.get(
                    "created_at"
                ),
                "updated_at": pr.get(
                    "updated_at"
                ),
                "head": pr.get(
                    "head", {}
                ).get("ref"),
                "base": pr.get(
                    "base", {}
                ).get("ref"),
            }
            for pr in pull_requests
        ],
    }


# ============================================================
# OLD / LEGACY GET ONE PULL REQUEST
# ============================================================

async def get_pull_request(
    pr_number: int
):

    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{settings.GITHUB_REPOSITORY}/pulls/"
        f"{pr_number}"
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
            "author": pr.get(
                "user", {}
            ).get("login"),
            "html_url": pr.get(
                "html_url"
            ),
            "head_branch": pr.get(
                "head", {}
            ).get("ref"),
            "base_branch": pr.get(
                "base", {}
            ).get("ref"),
            "created_at": pr.get(
                "created_at"
            ),
            "updated_at": pr.get(
                "updated_at"
            ),
            "merged": pr.get("merged"),
            "additions": pr.get(
                "additions"
            ),
            "deletions": pr.get(
                "deletions"
            ),
            "changed_files": pr.get(
                "changed_files"
            ),
        },
    }


# ============================================================
# OLD / LEGACY GET PULL REQUEST FILES
# ============================================================

async def get_pull_request_files(
    pr_number: int
):

    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{settings.GITHUB_REPOSITORY}/pulls/"
        f"{pr_number}/files"
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
            "message": (
                "Failed to fetch pull request files"
            ),
        }

    files = response.json()

    return {
        "success": True,
        "count": len(files),
        "files": [
            {
                "filename": file.get(
                    "filename"
                ),
                "status": file.get(
                    "status"
                ),
                "additions": file.get(
                    "additions"
                ),
                "deletions": file.get(
                    "deletions"
                ),
                "changes": file.get(
                    "changes"
                ),
                "patch": file.get(
                    "patch"
                ),
                "raw_url": file.get(
                    "raw_url"
                ),
                "blob_url": file.get(
                    "blob_url"
                ),
            }
            for file in files
        ],
    }


# ============================================================
# LEGACY REVIEW DATA
# ============================================================

async def get_pull_request_review_data(
    pr_number: int
):

    pr_result = await get_pull_request(
        pr_number
    )

    if not pr_result.get("success"):
        return pr_result

    files_result = await get_pull_request_files(
        pr_number
    )

    if not files_result.get("success"):
        return files_result

    return {
        "success": True,
        "pull_request": pr_result[
            "pull_request"
        ],
        "files": files_result[
            "files"
        ],
        "file_count": files_result[
            "count"
        ],
    }


# ============================================================
# GET AUTHENTICATED USER'S GITHUB REPOSITORIES
# ============================================================

async def get_user_repositories(
    github_access_token: str
):

    headers = {
        "Authorization": (
            f"Bearer {github_access_token}"
        ),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    params = {
        "visibility": "all",
        "affiliation": (
            "owner,collaborator,"
            "organization_member"
        ),
        "sort": "updated",
        "direction": "desc",
        "per_page": 100,
    }

    async with httpx.AsyncClient(
        timeout=15.0
    ) as client:

        response = await client.get(
            f"{GITHUB_API_URL}/user/repos",
            headers=headers,
            params=params,
        )

    if response.status_code == 401:

        return {
            "success": False,
            "status_code": 401,
            "message": (
                "GitHub authorization is invalid "
                "or expired"
            ),
        }

    if response.status_code != 200:

        return {
            "success": False,
            "status_code": response.status_code,
            "message": (
                "Failed to fetch GitHub repositories"
            ),
        }

    repositories = response.json()

    return {
        "success": True,
        "count": len(repositories),
        "repositories": [
            {
                "id": repo.get("id"),
                "name": repo.get("name"),
                "full_name": repo.get(
                    "full_name"
                ),
                "description": repo.get(
                    "description"
                ),
                "private": repo.get(
                    "private"
                ),
                "html_url": repo.get(
                    "html_url"
                ),
                "clone_url": repo.get(
                    "clone_url"
                ),
                "default_branch": repo.get(
                    "default_branch"
                ),
                "owner": repo.get(
                    "owner", {}
                ).get("login"),
            }
            for repo in repositories
        ],
    }


# ============================================================
# GET PULL REQUESTS FOR A CONNECTED GITHUB REPOSITORY
# ============================================================

async def get_repository_pull_requests(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
):

    if (
        not github_owner
        or not github_repository
    ):

        return {
            "success": False,
            "status_code": 400,
            "message": (
                "GitHub repository information "
                "is missing"
            ),
        }

    headers = {
        "Authorization": (
            f"Bearer {github_access_token}"
        ),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{github_owner}/"
        f"{github_repository}/pulls"
    )

    params = {
        "state": "all",
        "sort": "updated",
        "direction": "desc",
        "per_page": 100,
    }

    async with httpx.AsyncClient(
        timeout=15.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
            params=params,
        )

    if response.status_code == 401:

        return {
            "success": False,
            "status_code": 401,
            "message": (
                "GitHub authorization is invalid "
                "or expired. Please reconnect GitHub."
            ),
        }

    if response.status_code == 404:

        return {
            "success": False,
            "status_code": 404,
            "message": (
                "GitHub repository was not found "
                "or is not accessible."
            ),
        }

    if response.status_code != 200:

        return {
            "success": False,
            "status_code": response.status_code,
            "message": (
                "Failed to fetch GitHub Pull Requests"
            ),
        }

    pull_requests = response.json()

    return {
        "success": True,
        "count": len(pull_requests),
        "pull_requests": [
            {
                "number": pr.get(
                    "number"
                ),
                "title": pr.get(
                    "title"
                ),
                "body": pr.get(
                    "body"
                ),
                "state": pr.get(
                    "state"
                ),
                "draft": pr.get(
                    "draft"
                ),
                "author": (
                    pr.get(
                        "user", {}
                    ).get("login")
                ),
                "html_url": pr.get(
                    "html_url"
                ),
                "created_at": pr.get(
                    "created_at"
                ),
                "updated_at": pr.get(
                    "updated_at"
                ),
                "head_branch": (
                    pr.get(
                        "head", {}
                    ).get("ref")
                ),
                "base_branch": (
                    pr.get(
                        "base", {}
                    ).get("ref")
                ),
                "head_sha": (
                    pr.get(
                        "head", {}
                    ).get("sha")
                ),
                "base_sha": (
                    pr.get(
                        "base", {}
                    ).get("sha")
                ),
                "merged": pr.get(
                    "merged"
                ),
                "additions": pr.get(
                    "additions"
                ),
                "deletions": pr.get(
                    "deletions"
                ),
                "changed_files": pr.get(
                    "changed_files"
                ),
            }
            for pr in pull_requests
        ],
    }


# ============================================================
# GET A SPECIFIC GITHUB PULL REQUEST
# ============================================================

async def get_repository_pull_request(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
    pr_number: int,
):

    if (
        not github_owner
        or not github_repository
    ):

        return {
            "success": False,
            "status_code": 400,
            "message": (
                "GitHub repository information "
                "is missing"
            ),
        }

    headers = {
        "Authorization": (
            f"Bearer {github_access_token}"
        ),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{github_owner}/"
        f"{github_repository}/"
        f"pulls/{pr_number}"
    )

    async with httpx.AsyncClient(
        timeout=15.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
        )

    if response.status_code == 401:

        return {
            "success": False,
            "status_code": 401,
            "message": (
                "GitHub authorization is invalid "
                "or expired"
            ),
        }

    if response.status_code == 404:

        return {
            "success": False,
            "status_code": 404,
            "message": (
                "GitHub Pull Request was not found"
            ),
        }

    if response.status_code != 200:

        return {
            "success": False,
            "status_code": response.status_code,
            "message": (
                "Failed to fetch GitHub Pull Request"
            ),
        }

    pr = response.json()

    return {
        "success": True,
        "pull_request": {
            "number": pr.get(
                "number"
            ),
            "title": pr.get(
                "title"
            ),
            "body": pr.get(
                "body"
            ),
            "state": pr.get(
                "state"
            ),
            "draft": pr.get(
                "draft"
            ),
            "merged": pr.get(
                "merged"
            ),
            "author": (
                pr.get(
                    "user", {}
                ).get("login")
            ),
            "html_url": pr.get(
                "html_url"
            ),
            "created_at": pr.get(
                "created_at"
            ),
            "updated_at": pr.get(
                "updated_at"
            ),
            "head_branch": (
                pr.get(
                    "head", {}
                ).get("ref")
            ),
            "base_branch": (
                pr.get(
                    "base", {}
                ).get("ref")
            ),
            "head_sha": (
                pr.get(
                    "head", {}
                ).get("sha")
            ),
            "base_sha": (
                pr.get(
                    "base", {}
                ).get("sha")
            ),
            "mergeable": pr.get(
                "mergeable"
            ),
            "merged_at": pr.get(
                "merged_at"
            ),
            "additions": pr.get(
                "additions"
            ),
            "deletions": pr.get(
                "deletions"
            ),
            "changed_files": pr.get(
                "changed_files"
            ),
            "commits": pr.get(
                "commits"
            ),
            "comments": pr.get(
                "comments"
            ),
            "review_comments": pr.get(
                "review_comments"
            ),
        },
    }


# ============================================================
# GET FILES CHANGED IN A SPECIFIC PR
# ============================================================

async def get_repository_pull_request_files(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
    pr_number: int,
):

    if (
        not github_owner
        or not github_repository
    ):

        return {
            "success": False,
            "status_code": 400,
            "message": (
                "GitHub repository information "
                "is missing"
            ),
        }

    headers = {
        "Authorization": (
            f"Bearer {github_access_token}"
        ),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{github_owner}/"
        f"{github_repository}/"
        f"pulls/{pr_number}/files"
    )

    params = {
        "per_page": 100,
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
            params=params,
        )

    if response.status_code == 401:

        return {
            "success": False,
            "status_code": 401,
            "message": (
                "GitHub authorization is invalid "
                "or expired"
            ),
        }

    if response.status_code == 404:

        return {
            "success": False,
            "status_code": 404,
            "message": (
                "GitHub Pull Request was not found"
            ),
        }

    if response.status_code != 200:

        return {
            "success": False,
            "status_code": response.status_code,
            "message": (
                "Failed to fetch changed files"
            ),
        }

    files = response.json()

    return {
        "success": True,
        "count": len(files),
        "files": [
            {
                "filename": file.get(
                    "filename"
                ),
                "status": file.get(
                    "status"
                ),
                "additions": file.get(
                    "additions"
                ),
                "deletions": file.get(
                    "deletions"
                ),
                "changes": file.get(
                    "changes"
                ),
                "patch": file.get(
                    "patch"
                ),
                "raw_url": file.get(
                    "raw_url"
                ),
                "blob_url": file.get(
                    "blob_url"
                ),
            }
            for file in files
        ],
    }


# ============================================================
# GET ACTUAL PR DIFF
# ============================================================

async def get_repository_pull_request_diff(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
    pr_number: int,
):

    if (
        not github_owner
        or not github_repository
    ):

        return {
            "success": False,
            "status_code": 400,
            "message": (
                "GitHub repository information "
                "is missing"
            ),
        }

    headers = {
        "Authorization": (
            f"Bearer {github_access_token}"
        ),
        "Accept": "application/vnd.github.v3.diff",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{github_owner}/"
        f"{github_repository}/"
        f"pulls/{pr_number}"
    )

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.get(
            url,
            headers=headers,
        )

    if response.status_code == 401:

        return {
            "success": False,
            "status_code": 401,
            "message": (
                "GitHub authorization is invalid "
                "or expired"
            ),
        }

    if response.status_code == 404:

        return {
            "success": False,
            "status_code": 404,
            "message": (
                "GitHub Pull Request was not found"
            ),
        }

    if response.status_code != 200:

        return {
            "success": False,
            "status_code": response.status_code,
            "message": (
                "Failed to fetch pull request diff"
            ),
        }

    return {
        "success": True,
        "diff": response.text,
    }


# ============================================================
# GET COMPLETE PR REVIEW DATA
#
# This is the data the AI reviewer will eventually consume.
# ============================================================

async def get_repository_pull_request_review_data(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
    pr_number: int,
):

    pr_result = await get_repository_pull_request(
        github_access_token=github_access_token,
        github_owner=github_owner,
        github_repository=github_repository,
        pr_number=pr_number,
    )

    if not pr_result.get("success"):
        return pr_result

    files_result = (
        await get_repository_pull_request_files(
            github_access_token=github_access_token,
            github_owner=github_owner,
            github_repository=github_repository,
            pr_number=pr_number,
        )
    )

    if not files_result.get("success"):
        return files_result

    diff_result = (
        await get_repository_pull_request_diff(
            github_access_token=github_access_token,
            github_owner=github_owner,
            github_repository=github_repository,
            pr_number=pr_number,
        )
    )

    if not diff_result.get("success"):
        return diff_result

    return {
        "success": True,
        "pull_request": pr_result[
            "pull_request"
        ],
        "files": files_result[
            "files"
        ],
        "file_count": files_result[
            "count"
        ],
        "diff": diff_result[
            "diff"
        ],
    }

# ============================================================
# MERGE A GITHUB PULL REQUEST
# ============================================================

async def merge_repository_pull_request(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
    pr_number: int,
    merge_method: str = "merge",
):
    """
    Merge a GitHub Pull Request.

    GitHub remains the source of truth. This function performs
    the real merge operation in the connected repository.
    """

    if not github_owner or not github_repository:
        return {
            "success": False,
            "status_code": 400,
            "message": "GitHub repository information is missing",
        }

    if merge_method not in {"merge", "squash", "rebase"}:
        return {
            "success": False,
            "status_code": 400,
            "message": "Invalid merge method",
        }

    headers = {
        "Authorization": f"Bearer {github_access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{github_owner}/{github_repository}/"
        f"pulls/{pr_number}/merge"
    )

    payload = {
        "merge_method": merge_method,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.put(
            url,
            headers=headers,
            json=payload,
        )

    if response.status_code == 401:
        return {
            "success": False,
            "status_code": 401,
            "message": (
                "GitHub authorization is invalid or expired. "
                "Please reconnect GitHub."
            ),
        }

    if response.status_code == 404:
        return {
            "success": False,
            "status_code": 404,
            "message": "GitHub Pull Request was not found",
        }

    if response.status_code == 405:
        return {
            "success": False,
            "status_code": 405,
            "message": (
                "GitHub does not allow this pull request "
                "to be merged."
            ),
        }

    if response.status_code == 409:
        return {
            "success": False,
            "status_code": 409,
            "message": (
                "GitHub could not merge this pull request. "
                "It may have merge conflicts or the branch "
                "may no longer be up to date."
            ),
        }

    if response.status_code not in {200, 201}:
        try:
            github_message = response.json().get("message")
        except Exception:
            github_message = None

        return {
            "success": False,
            "status_code": response.status_code,
            "message": (
                github_message
                or "Failed to merge GitHub Pull Request"
            ),
        }

    result = response.json()

    return {
        "success": bool(result.get("merged")),
        "status_code": response.status_code,
        "merged": result.get("merged"),
        "sha": result.get("sha"),
        "message": result.get(
            "message",
            "Pull request merged successfully",
        ),
    }


# ============================================================
# CLOSE A GITHUB PULL REQUEST
# ============================================================

async def close_repository_pull_request(
    github_access_token: str,
    github_owner: str,
    github_repository: str,
    pr_number: int,
):
    """
    Close a GitHub Pull Request without merging it.
    """

    if not github_owner or not github_repository:
        return {
            "success": False,
            "status_code": 400,
            "message": "GitHub repository information is missing",
        }

    headers = {
        "Authorization": f"Bearer {github_access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    }

    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{github_owner}/{github_repository}/"
        f"pulls/{pr_number}"
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.patch(
            url,
            headers=headers,
            json={"state": "closed"},
        )

    if response.status_code == 401:
        return {
            "success": False,
            "status_code": 401,
            "message": (
                "GitHub authorization is invalid or expired. "
                "Please reconnect GitHub."
            ),
        }

    if response.status_code == 404:
        return {
            "success": False,
            "status_code": 404,
            "message": "GitHub Pull Request was not found",
        }

    if response.status_code not in {200, 201}:
        try:
            github_message = response.json().get("message")
        except Exception:
            github_message = None

        return {
            "success": False,
            "status_code": response.status_code,
            "message": (
                github_message
                or "Failed to close GitHub Pull Request"
            ),
        }

    pr = response.json()

    return {
        "success": True,
        "status_code": response.status_code,
        "state": pr.get("state"),
        "merged": pr.get("merged"),
        "pull_request": {
            "number": pr.get("number"),
            "title": pr.get("title"),
            "state": pr.get("state"),
            "merged": pr.get("merged"),
            "merged_at": pr.get("merged_at"),
            "updated_at": pr.get("updated_at"),
            "html_url": pr.get("html_url"),
        },
        "message": "Pull request closed successfully",
    }