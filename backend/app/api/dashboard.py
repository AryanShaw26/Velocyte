from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

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


# ============================================================
# DASHBOARD STATS
# ============================================================

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # Total active projects owned by current user
    # --------------------------------------------------------

    project_count = (
        db.query(Project)
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .count()
    )


    # --------------------------------------------------------
    # Open tasks in the current user's projects
    #
    # Count all unfinished tasks belonging to projects owned by
    # the current user.
    # --------------------------------------------------------

    open_task_count = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            Task.status != "done"
        )
        .count()
    )


    # --------------------------------------------------------
    # OPEN PULL REQUESTS
    #
    # IMPORTANT:
    #
    # The dashboard card should show ONLY currently open
    # Pull Requests.
    #
    # Merged and closed Pull Requests must NOT be counted.
    # --------------------------------------------------------

    open_pull_request_count = (
        db.query(PullRequest)
        .join(
            Project,
            PullRequest.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            PullRequest.status == "open"
        )
        .count()
    )


    # --------------------------------------------------------
    # AI reviews belonging to user's projects
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # FINAL DASHBOARD RESPONSE
    # --------------------------------------------------------

    return {
        "projects": project_count,
        "open_tasks": open_task_count,
        "pull_requests": open_pull_request_count,
        "ai_reviews": ai_review_count
    }


# ============================================================
# RECENT PROJECTS
# ============================================================

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


# ============================================================
# RECENT ACTIVITY
# ============================================================

@router.get("/activity")
def get_dashboard_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    activities = []


    # --------------------------------------------------------
    # PROJECT ACTIVITY
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # TASK ACTIVITY
    # --------------------------------------------------------

    tasks = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id
        )
        .order_by(Task.id.desc())
        .limit(5)
        .all()
    )


    for task in tasks:

        if task.status == "done":
            activity_title = "Task completed"
        else:
            activity_title = "Task updated"


        activities.append({
            "id": f"task-{task.id}",
            "type": "task",
            "title": activity_title,
            "description": task.title,
            "time": "Recently"
        })


    # --------------------------------------------------------
    # PULL REQUEST ACTIVITY
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # AI REVIEW ACTIVITY
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # LIMIT RESULTS
    # --------------------------------------------------------

    return activities[:10]


# ============================================================
# ANALYTICS
# ============================================================

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ========================================================
    # PROJECT ANALYTICS
    # ========================================================

    total_projects = (
        db.query(Project)
        .filter(
            Project.owner_id == current_user.id,
            Project.is_archived == False
        )
        .count()
    )


    # ========================================================
    # TASK ANALYTICS
    # ========================================================

    total_tasks = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id
        )
        .count()
    )


    # --------------------------------------------------------
    # Completed tasks
    # --------------------------------------------------------

    completed_tasks = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            Task.status == "done"
        )
        .count()
    )


    # --------------------------------------------------------
    # Open tasks
    # --------------------------------------------------------

    open_tasks = (
        db.query(Task)
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            Task.status != "done"
        )
        .count()
    )


    # ========================================================
    # TASK STATUS DISTRIBUTION
    # ========================================================

    task_status_rows = (
        db.query(
            Task.status,
            func.count(Task.id)
        )
        .join(
            Project,
            Task.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id
        )
        .group_by(Task.status)
        .all()
    )


    task_status_distribution = {
        status: count
        for status, count in task_status_rows
    }


    # ========================================================
    # PULL REQUEST ANALYTICS
    # ========================================================

    total_pull_requests = (
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


    # ========================================================
    # AI REVIEW ANALYTICS
    # ========================================================

    total_ai_reviews = (
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


    # ========================================================
    # Average AI score
    # ========================================================

    average_score = (
        db.query(func.avg(AIReview.score))
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            AIReview.score.isnot(None)
        )
        .scalar()
    )


    if average_score is not None:
        average_score = round(
            float(average_score),
            2
        )


    # ========================================================
    # AI SCORE DISTRIBUTION
    # ========================================================

    excellent_reviews = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            AIReview.score >= 90
        )
        .count()
    )


    good_reviews = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            AIReview.score >= 70,
            AIReview.score < 90
        )
        .count()
    )


    needs_improvement_reviews = (
        db.query(AIReview)
        .join(
            Project,
            AIReview.project_id == Project.id
        )
        .filter(
            Project.owner_id == current_user.id,
            AIReview.score < 70
        )
        .count()
    )


    # ========================================================
    # FINAL ANALYTICS RESPONSE
    # ========================================================

    return {
        "projects": {
            "total": total_projects
        },

        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "open": open_tasks,
            "status_distribution": task_status_distribution
        },

        "pull_requests": {
            "total": total_pull_requests
        },

        "ai_reviews": {
            "total": total_ai_reviews,
            "average_score": average_score,
            "score_distribution": {
                "excellent": excellent_reviews,
                "good": good_reviews,
                "needs_improvement": needs_improvement_reviews
            }
        }
    }