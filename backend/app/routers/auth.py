from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.dependencies import get_current_user
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.get("/health")
def auth_health():

    return {
        "status": "ok",
        "service": "authentication"
    }


# =========================
# REGISTER
# =========================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == data.email.lower())
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    hashed_password = hash_password(
        data.password
    )

    new_user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=hashed_password,
        is_verified=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=str(new_user.id),
        name=new_user.name,
        email=new_user.email,
        is_verified=new_user.is_verified
    )


# =========================
# LOGIN
# =========================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == data.email.lower())
        .first()
    )

    # Don't reveal whether the email exists
    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    password_valid = verify_password(
        data.password,
        user.password_hash
    )

    if not password_valid:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        str(user.id)
    )

    refresh_token = create_refresh_token(
        str(user.id)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            is_verified=user.is_verified
        )
    )

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user = Depends(get_current_user)
):

    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        is_verified=current_user.is_verified
    )