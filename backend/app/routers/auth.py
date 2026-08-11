import uuid

from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.responses import RedirectResponse

from jose import JWTError, jwt

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User

from app.core.dependencies import get_current_user
from app.core.config import settings

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    ProfileUpdateRequest,
    UserResponse,
    TokenResponse,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# ============================================================
# CONSTANTS
# ============================================================

JWT_ALGORITHM = "HS256"

GITHUB_AUTHORIZE_URL = (
    "https://github.com/login/oauth/authorize"
)

GITHUB_ACCESS_TOKEN_URL = (
    "https://github.com/login/oauth/access_token"
)

GITHUB_USER_URL = (
    "https://api.github.com/user"
)

GITHUB_EMAILS_URL = (
    "https://api.github.com/user/emails"
)


# ============================================================
# HEALTH
# ============================================================

@router.get("/health")
def auth_health():

    return {
        "status": "ok",
        "service": "authentication"
    }


# ============================================================
# REGISTER
# ============================================================

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
        .filter(
            User.email == data.email.lower()
        )
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


# ============================================================
# LOGIN
# ============================================================

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
        .filter(
            User.email == data.email.lower()
        )
        .first()
    )

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


# ============================================================
# REFRESH ACCESS TOKEN
# ============================================================

@router.post(
    "/refresh",
    response_model=TokenResponse
)
def refresh_access_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):

    try:

        user_id = decode_refresh_token(
            refresh_token
        )

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    new_access_token = create_access_token(
        str(user.id)
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            is_verified=user.is_verified
        )
    )


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):

    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        is_verified=current_user.is_verified
    )


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.patch(
    "/profile",
    response_model=UserResponse
)
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if data.name is not None:

        current_user.name = data.name.strip()

    if data.email is not None:

        new_email = data.email.lower()

        existing_user = (
            db.query(User)
            .filter(
                User.email == new_email,
                User.id != current_user.id
            )
            .first()
        )

        if existing_user:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered"
            )

        current_user.email = new_email

    db.commit()

    db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        is_verified=current_user.is_verified
    )


# ============================================================
# GITHUB OAUTH — START
# ============================================================

@router.get("/github")
def github_login():

    expire = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    state = jwt.encode(
        {
            "type": "github_oauth_state",
            "nonce": str(uuid.uuid4()),
            "exp": expire,
        },
        settings.SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_OAUTH_CALLBACK_URL,
        "scope": "repo read:user user:email",
        "state": state,
    }

    github_authorization_url = (
        f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}"
    )

    return RedirectResponse(
        url=github_authorization_url,
        status_code=status.HTTP_302_FOUND
    )


# ============================================================
# GITHUB OAUTH — CONNECT TO EXISTING VELOCYTE ACCOUNT
# ============================================================

@router.post("/github/connect")
def github_connect(
    current_user: User = Depends(get_current_user),
):
    """
    Start GitHub OAuth for an already authenticated
    Velocyte user.

    Unlike /github, this endpoint does NOT create or
    switch Velocyte accounts.
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    state = jwt.encode(
        {
            "type": "github_connect_state",
            "user_id": str(current_user.id),
            "nonce": str(uuid.uuid4()),
            "exp": expire,
        },
        settings.SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_OAUTH_CALLBACK_URL,
        "scope": "repo read:user user:email",
        "state": state,
    }

    github_authorization_url = (
        f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}"
    )

    return {
        "authorization_url": github_authorization_url
    }


# ============================================================
# GITHUB OAUTH — CALLBACK
# ============================================================

@router.get("/github/callback")
async def github_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # User cancelled GitHub authorization
    # --------------------------------------------------------

    if error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub authorization failed: {error}"
        )

    if not code:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub authorization code is missing"
        )

    if not state:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth state is missing"
        )

    # --------------------------------------------------------
    # Validate OAuth state
    # --------------------------------------------------------

    try:

        state_payload = jwt.decode(
            state,
            settings.SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        oauth_type = state_payload.get("type")

        if oauth_type not in {
            "github_oauth_state",
            "github_connect_state"
        }:

            raise JWTError()

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state"
        )

    # --------------------------------------------------------
    # Exchange authorization code for GitHub access token
    # --------------------------------------------------------

    async with httpx.AsyncClient(
        timeout=15.0
    ) as client:

        token_response = await client.post(
            GITHUB_ACCESS_TOKEN_URL,
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": (
                    settings.GITHUB_OAUTH_CALLBACK_URL
                ),
            },
            headers={
                "Accept": "application/json"
            }
        )

        if token_response.status_code != 200:

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "Failed to exchange GitHub "
                    "authorization code"
                )
            )

        token_data = token_response.json()

        github_access_token = token_data.get(
            "access_token"
        )

        if not github_access_token:

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub did not return an access token"
            )

        # ----------------------------------------------------
        # Get authenticated GitHub user
        # ----------------------------------------------------

        github_headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": (
                f"Bearer {github_access_token}"
            ),
            "X-GitHub-Api-Version": "2022-11-28",
        }

        github_user_response = await client.get(
            GITHUB_USER_URL,
            headers=github_headers
        )

        if github_user_response.status_code != 200:

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to retrieve GitHub user"
            )

        github_user = github_user_response.json()

        github_id = str(
            github_user.get("id")
        )

        github_username = github_user.get(
            "login"
        )

        if not github_id or not github_username:

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "GitHub user information is incomplete"
                )
            )

        # ----------------------------------------------------
        # Get GitHub email addresses
        # ----------------------------------------------------

        email_response = await client.get(
            GITHUB_EMAILS_URL,
            headers=github_headers
        )

        github_email = None

        if email_response.status_code == 200:

            github_emails = email_response.json()

            # Prefer primary + verified email
            for email_data in github_emails:

                if (
                    email_data.get("primary")
                    and email_data.get("verified")
                ):

                    github_email = email_data.get(
                        "email"
                    )

                    break

            # Fallback to any verified email
            if not github_email:

                for email_data in github_emails:

                    if email_data.get("verified"):

                        github_email = email_data.get(
                            "email"
                        )

                        break

        # ----------------------------------------------------
        # Fallback to public GitHub email
        # ----------------------------------------------------

        if not github_email:

            github_email = github_user.get(
                "email"
            )

        if not github_email:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No verified email was available "
                    "from your GitHub account"
                )
            )

        github_email = github_email.lower()

    # ========================================================
    # CONNECT GITHUB TO EXISTING VELOCYTE ACCOUNT
    # ========================================================

    if oauth_type == "github_connect_state":

        # ----------------------------------------------------
        # Get Velocyte user ID from signed OAuth state
        # ----------------------------------------------------

        target_user_id = state_payload.get(
            "user_id"
        )

        if not target_user_id:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Velocyte user information is missing"
            )

        # ----------------------------------------------------
        # Find the Velocyte account
        # ----------------------------------------------------

        target_user = (
            db.query(User)
            .filter(
                User.id == target_user_id
            )
            .first()
        )

        if not target_user:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Velocyte account no longer exists"
            )

        # ----------------------------------------------------
        # Check whether this GitHub account is already
        # connected to another Velocyte account
        # ----------------------------------------------------

        linked_user = (
            db.query(User)
            .filter(
                User.github_id == github_id
            )
            .first()
        )

        if (
            linked_user
            and linked_user.id != target_user.id
        ):

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This GitHub account is already connected "
                    "to another Velocyte account."
                )
            )

        # ----------------------------------------------------
        # Check whether current Velocyte account already has
        # a DIFFERENT GitHub account connected
        # ----------------------------------------------------

        if (
            target_user.github_id
            and target_user.github_id != github_id
        ):

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Your Velocyte account is already connected "
                    "to a different GitHub account."
                )
            )

        # ----------------------------------------------------
        # Attach GitHub to this exact Velocyte account
        # ----------------------------------------------------

        target_user.github_id = github_id

        target_user.github_username = github_username

        target_user.github_access_token = (
            github_access_token
        )

        target_user.is_verified = True

        db.commit()

        db.refresh(target_user)

        # ----------------------------------------------------
        # Redirect to frontend connection callback
        #
        # We use QUERY PARAMETERS instead of a URL fragment.
        #
        # We intentionally DO NOT send the GitHub access
        # token or Velocyte JWT through the URL.
        # ----------------------------------------------------

        params = urlencode(
            {
                "status": "success",
                "github_username": github_username,
            }
        )

        frontend_url = (
            f"{settings.FRONTEND_URL}"
            f"/github-connect-callback?{params}"
        )

        print(
            "GITHUB CONNECT REDIRECT:",
            frontend_url
        )

        return RedirectResponse(
            url=frontend_url,
            status_code=status.HTTP_302_FOUND
        )

    # ========================================================
    # NORMAL GITHUB LOGIN
    # ========================================================

    # --------------------------------------------------------
    # Find existing user by GitHub ID
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.github_id == github_id
        )
        .first()
    )

    # ========================================================
    # LINK GITHUB TO EXISTING EMAIL ACCOUNT
    # ========================================================

    if not user:

        user = (
            db.query(User)
            .filter(
                User.email == github_email
            )
            .first()
        )

        if user:

            user.github_id = github_id

            user.github_username = (
                github_username
            )

            user.github_access_token = (
                github_access_token
            )

            user.is_verified = True

    # ========================================================
    # CREATE NEW USER
    # ========================================================

    if not user:

        unusable_password = hash_password(
            f"github-oauth-{uuid.uuid4()}"
        )

        user = User(
            name=(
                github_user.get("name")
                or github_username
            ),

            email=github_email,

            password_hash=unusable_password,

            github_id=github_id,

            github_username=github_username,

            github_access_token=(
                github_access_token
            ),

            is_verified=True
        )

        db.add(user)

    # ========================================================
    # UPDATE EXISTING GITHUB USER
    # ========================================================

    else:

        user.github_id = github_id

        user.github_username = (
            github_username
        )

        user.github_access_token = (
            github_access_token
        )

    # ========================================================
    # SAVE USER
    # ========================================================

    db.commit()

    db.refresh(user)

    # ========================================================
    # CREATE VELOCYTE TOKENS
    # ========================================================

    access_token = create_access_token(
        str(user.id)
    )

    refresh_token = create_refresh_token(
        str(user.id)
    )

    # ========================================================
    # REDIRECT TO FRONTEND
    # ========================================================

    params = urlencode(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    )

    frontend_url = (
        f"{settings.FRONTEND_URL}"
        f"/github-callback#{params}"
    )

    return RedirectResponse(
        url=frontend_url,
        status_code=status.HTTP_302_FOUND
    )