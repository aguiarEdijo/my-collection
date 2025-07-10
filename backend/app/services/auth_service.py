from typing import Optional
from app.models.user import UserInDB, Token
from app.services.user_service import user_service
from app.core.security import security_manager
from app.utils.security import verify_password, create_access_token, create_refresh_token, sanitize_username
import logging

logger = logging.getLogger("auth_service")

class AuthService:
    @staticmethod
    def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
        try:
            username = sanitize_username(username)
        except ValueError:
            if username.lower() != "admin":
                logger.warning(f"Invalid username: {username}")
                return None
            username = username.lower()
        
        user = user_service.get_user_by_username(username)
        
        if not user:
            logger.warning(f"User not found: {username}")
            return None
        
        if not user.is_active:
            logger.warning(f"Inactive account: {username}")
            return None
        
        if security_manager.is_account_locked(user):
            logger.warning(f"Account locked: {username}")
            return None
        
        if not verify_password(password, user.password):
            security_manager.record_failed_login(user)
            logger.warning(f"Wrong password: {username}")
            return None
        
        security_manager.reset_failed_attempts(user)
        logger.info(f"Successful login: {username}")
        return user
    
    @staticmethod
    def create_tokens_for_user(user: UserInDB) -> Token:
        access_token = create_access_token(data={"sub": user.username})
        refresh_token = create_refresh_token(data={"sub": user.username})
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=900
        )

auth_service = AuthService()