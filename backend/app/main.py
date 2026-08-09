from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.database import Base, engine
from app.db import models
from app.routers.auth import router as auth_router
from app.models.project import Project
from app.models.task import Task
from app.models.pull_request import PullRequest
from app.models.ai_review import AIReview
from app.db import models
from app.api.dashboard import router as dashboard_router
from app.routers.projects import router as projects_router

from fastapi.middleware.cors import CORSMiddleware
@asynccontextmanager
async def lifespan(app: FastAPI):

    Base.metadata.create_all(
        bind=engine
    )

    yield


app = FastAPI(
    title="Velocyte API",
    description="AI-Powered Developer Productivity Platform",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
# ==========================
# API ROUTES
# ==========================

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(projects_router)

@app.get("/")
def root():

    return {
        "message": "Velocyte API is running"
    }