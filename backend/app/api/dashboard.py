from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.dependencies import get_current_user

from app.models.project import Project
from app.models.task import Task
from app.models.pull_request import PullRequest
from app.models.ai_review import AIReview


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


# ==========================================
# DASHBOARD STATS
# ==========================================

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    project_count = (
        db.query(Project)
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .count()
    )

    open_task_count = (
        db.query(Task)
        .filter(
            Task.assigned_to == current_user.id,
            Task.status != "done"
        )
        .count()
    )

    pull_request_count = (
        db.query(PullRequest)
        .join(
            Project,
            PullRequest.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id
        )
        .count()
    )

    ai_review_count = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id
        )
        .count()
    )

    return {
        "projects": project_count,
        "open_tasks": open_task_count,
        "pull_requests": pull_request_count,
        "ai_reviews": ai_review_count
    }


# ==========================================
# RECENT PROJECTS
# ==========================================

@router.get("/projects")
def get_dashboard_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    projects = (
        db.query(Project)
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .order_by(Project.id.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": str(project.id),
            "name": project.name,
            "description": project.description,
            "status": "Active",
            "updated": "Recently"
        }
        for project in projects
    ]

# ==========================================
# RECENT ACTIVITY
# ==========================================

@router.get("/activity")
def get_dashboard_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    activities = []

    # --------------------------------------
    # PROJECT ACTIVITY
    # --------------------------------------

    projects = (
        db.query(Project)
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .order_by(Project.id.desc())
        .limit(5)
        .all()
    )

    for project in projects:

        activities.append({
            "id": f"project-{project.id}",
            "type": "project",
            "title": "Project created",
            "description": project.name,
            "time": "Recently"
        })


    # --------------------------------------
    # TASK ACTIVITY
    # --------------------------------------

    tasks = (
        db.query(Task)
        .filter(
            Task.assigned_to == current_user.id
        )
        .order_by(Task.id.desc())
        .limit(5)
        .all()
    )

    for task in tasks:

        if task.status == "done":
            activity_title = "Task completed"
        else:
            activity_title = "Task assigned"

        activities.append({
            "id": f"task-{task.id}",
            "type": "task",
            "title": activity_title,
            "description": task.title,
            "time": "Recently"
        })


    # --------------------------------------
    # PULL REQUEST ACTIVITY
    # --------------------------------------

    pull_requests = (
        db.query(PullRequest)
        .join(
            Project,
            PullRequest.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id
        )
        .order_by(PullRequest.id.desc())
        .limit(5)
        .all()
    )

    for pull_request in pull_requests:

        activities.append({
            "id": f"pr-{pull_request.id}",
            "type": "pull_request",
            "title": "Pull request opened",
            "description": pull_request.title,
            "time": "Recently"
        })


    # --------------------------------------
    # AI REVIEW ACTIVITY
    # --------------------------------------

    ai_reviews = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id
        )
        .order_by(AIReview.id.desc())
        .limit(5)
        .all()
    )

    for review in ai_reviews:

        activities.append({
            "id": f"review-{review.id}",
            "type": "ai_review",
            "title": "AI review completed",
            "description": (
                f"Score: {review.score}"
                if review.score is not None
                else "Code review completed"
            ),
            "time": "Recently"
        })


    # --------------------------------------
    # LIMIT DASHBOARD ACTIVITY
    # --------------------------------------

    return activities[:10]