from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserResponse, Token
from app.services.auth_service import auth_service
from app.services.user_service import user_service
from app.core.dependencies import rate_limit_dependency
from app.utils.security import decode_refresh_token, revoke_token
import logging

router = APIRouter()
logger = logging.getLogger("auth_routes")
audit_logger = logging.getLogger("audit")

@router.post("/register", response_model=UserResponse)
def register(
    request: Request, 
    user_data: UserCreate,
    _: bool = Depends(rate_limit_dependency(20))
):
    try:
        new_user = user_service.create_user(user_data)
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao criar usuário"
            )
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"User registered: {new_user.username} - IP: {client_ip}")
        audit_logger.info(f"USER_REGISTER - Username: {new_user.username} - IP: {client_ip}")
        return new_user
        
    except ValueError as e:
        client_ip = request.client.host if request.client else "unknown"
        logger.warning(f"Invalid registration: {str(e)} - IP: {client_ip}")
        audit_logger.warning(f"USER_REGISTER_FAILED - Error: {str(e)} - IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/login", response_model=Token)
def login(
    request: Request, 
    form_data: OAuth2PasswordRequestForm = Depends(),
    _: bool = Depends(rate_limit_dependency(30))
):
    try:
        user = auth_service.authenticate_user(form_data.username, form_data.password)
        
        if not user:
            client_ip = request.client.host if request.client else "unknown"
            logger.warning(f"Failed login: {form_data.username} - IP: {client_ip}")
            audit_logger.warning(f"LOGIN_FAILED - Username: {form_data.username} - IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas ou conta bloqueada",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        tokens = auth_service.create_tokens_for_user(user)
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Successful login: {user.username} - IP: {client_ip}")
        audit_logger.info(f"LOGIN_SUCCESS - Username: {user.username} - IP: {client_ip}")
        return tokens
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/refresh", response_model=Token)
def refresh_token(
    request: Request, 
    refresh_data: dict,
    _: bool = Depends(rate_limit_dependency(50))
):
    try:
        refresh_token = refresh_data.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token é obrigatório"
            )
        
        payload = decode_refresh_token(refresh_token)
        
        if not payload:
            client_ip = request.client.host if request.client else "unknown"
            logger.warning(f"Invalid refresh token - IP: {client_ip}")
            audit_logger.warning(f"REFRESH_TOKEN_INVALID - IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido ou expirado"
            )
        
        username = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        user = user_service.get_user_by_username(username)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado ou inativo"
            )
        
        revoke_token(refresh_token)
        new_tokens = auth_service.create_tokens_for_user(user)
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Token refreshed: {username} - IP: {client_ip}")
        audit_logger.info(f"TOKEN_REFRESH - Username: {username} - IP: {client_ip}")
        return new_tokens
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refresh token error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/logout")
def logout(request: Request, token_data: dict):
    try:
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        
        if access_token:
            revoke_token(access_token)
        if refresh_token:
            revoke_token(refresh_token)
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Logout completed - IP: {client_ip}")
        audit_logger.info(f"LOGOUT - IP: {client_ip}")
        return {"message": "Logout realizado com sucesso"}
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )