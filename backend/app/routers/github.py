from fastapi import APIRouter

from app.services.github_service import test_github_connection


router = APIRouter(
    prefix="/api/github",
    tags=["GitHub"],
)


@router.get("/test")
async def test_connection():
    return await test_github_connection()