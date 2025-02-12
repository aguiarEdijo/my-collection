from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.services.auth_service import AuthService
from app.utils.security import create_access_token

router = APIRouter()

@router.post("/register")
def register(user: User):
    new_user = AuthService.create_user(user)
    return {"message": "Usuário registrado com sucesso", "user": new_user}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = AuthService.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = AuthService.create_access_token_for_user(user)
    return {"access_token": access_token, "token_type": "bearer"}