# ============================================================
# Velocyte - GitHub Service
# ============================================================
#
# Handles communication between Velocyte and GitHub.
#
# Responsibilities:
# 1. Test GitHub connection
# 2. Fetch Pull Request details
# 3. Fetch changed files
# 4. Fetch code patches/diffs
#
# The returned PR review data will later be sent to
# the AI review engine.
# ============================================================

import os

from dotenv import load_dotenv
from github import Github
from github.GithubException import GithubException


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

# Load backend/.env
#
# github_service.py is located at:
#
# backend/app/services/github_service.py
#
# The .env file is located at:
#
# backend/.env
#
# Using load_dotenv() allows Python to find the .env file
# when the backend is started from the backend directory.

load_dotenv()


# ============================================================
# CONFIGURATION
# ============================================================

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

GITHUB_REPOSITORY = os.getenv(
    "GITHUB_REPOSITORY",
    "AryanShaw26/Velocyte",
)


# ============================================================
# CREATE GITHUB CLIENT
# ============================================================

def get_github_client():
    """
    Create and return a GitHub API client.
    """

    token = os.getenv("GITHUB_TOKEN")

    if not token:

        raise RuntimeError(
            "GITHUB_TOKEN is not configured. "
            "Please add GITHUB_TOKEN to backend/.env."
        )

    return Github(token)


# ============================================================
# GET REPOSITORY
# ============================================================

def get_repository():
    """
    Connect to the configured GitHub repository.
    """

    github = get_github_client()

    repository_name = os.getenv(
        "GITHUB_REPOSITORY",
        "AryanShaw26/Velocyte",
    )

    return github.get_repo(repository_name)


# ============================================================
# TEST GITHUB CONNECTION
# ============================================================

def test_github_connection():
    """
    Test whether Velocyte can connect to GitHub.
    """

    try:

        repository = get_repository()

        return {
            "connected": True,
            "repository": repository.full_name,
            "name": repository.name,
            "private": repository.private,
        }

    except GithubException as error:

        return {
            "connected": False,
            "error": (
                f"GitHub API error: "
                f"{error}"
            ),
        }

    except Exception as error:

        return {
            "connected": False,
            "error": str(error),
        }


# ============================================================
# GET PULL REQUEST
# ============================================================

def get_pull_request(pr_number: int):
    """
    Fetch basic information about a Pull Request.
    """

    repository = get_repository()

    pull_request = repository.get_pull(
        pr_number
    )

    return {
        "number": pull_request.number,
        "title": pull_request.title,
        "body": pull_request.body,
        "state": pull_request.state,
        "merged": pull_request.merged,

        "author": (
            pull_request.user.login
            if pull_request.user
            else None
        ),

        "source_branch": pull_request.head.ref,
        "target_branch": pull_request.base.ref,

        "html_url": pull_request.html_url,

        "created_at": (
            pull_request.created_at.isoformat()
            if pull_request.created_at
            else None
        ),

        "updated_at": (
            pull_request.updated_at.isoformat()
            if pull_request.updated_at
            else None
        ),
    }


# ============================================================
# GET PULL REQUEST FILES
# ============================================================

def get_pull_request_files(pr_number: int):
    """
    Fetch all files changed by a Pull Request.

    Includes:
    - filename
    - status
    - additions
    - deletions
    - total changes
    - patch/diff
    """

    repository = get_repository()

    pull_request = repository.get_pull(
        pr_number
    )

    files = []

    for file in pull_request.get_files():

        files.append({

            "filename": file.filename,

            "status": file.status,

            "additions": file.additions,

            "deletions": file.deletions,

            "changes": file.changes,

            "patch": file.patch,

        })

    return files


# ============================================================
# GET COMPLETE PULL REQUEST REVIEW DATA
# ============================================================

def get_pull_request_review_data(pr_number: int):
    """
    Return all information required by the future AI
    review engine.
    """

    pull_request = get_pull_request(
        pr_number
    )

    files = get_pull_request_files(
        pr_number
    )

    return {

        "pull_request": pull_request,

        "files": files,

        "total_files": len(files),

    }