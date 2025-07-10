from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from app.models.user import UserInDB
from app.services.user_service import user_service
from app.core.security import rate_limiter
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = user_service.get_user_by_username(username)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verifica se o usuário tem ID válido
    if not user.id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno: usuário sem ID válido"
        )
    
    return user

def rate_limit_dependency(max_requests: int, window_minutes: int = 1):
    def rate_limit(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        endpoint = request.url.path
        key = f"{client_ip}:{endpoint}"
        
        if not rate_limiter.check_limit(key, max_requests, window_minutes):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Muitas tentativas. Tente novamente mais tarde."
            )
        return True
    
    return rate_limit 