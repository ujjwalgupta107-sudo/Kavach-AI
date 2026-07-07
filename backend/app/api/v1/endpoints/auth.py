from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginResponse, Token
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedException, ValidationException
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    user_repo = UserRepository(db)
    
    existing_user = await user_repo.get_by_email(user_in.email)
    if existing_user:
        raise ValidationException("Email already registered")
        
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )
    
    return await user_repo.create(user)

@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise UnauthorizedException("Incorrect email or password")
        
    if not user.is_active:
        raise UnauthorizedException("Inactive user")

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await user_repo.update(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return LoginResponse(
        user=user,
        token=Token(access_token=access_token, refresh_token=refresh_token)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
):
    return current_user
