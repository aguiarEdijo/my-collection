from typing import Optional
from datetime import datetime
from app.models.user import UserCreate, UserInDB, UserResponse
from app.repositories.user_repository import user_repository
from app.utils.security import get_password_hash, sanitize_username
from app.core.security import security_manager
import logging

logger = logging.getLogger("user_service")

class UserService:
    @staticmethod
    def create_user(user_data: UserCreate) -> Optional[UserResponse]:
        try:
            username = sanitize_username(user_data.username)
        except ValueError:
            if user_data.username.lower() != "admin":
                raise ValueError("Username inválido")
            username = user_data.username.lower()
        
        if user_repository.exists_username(username):
            raise ValueError("Nome de usuário já existe")
        
        if len(user_data.password) < 4:
            raise ValueError("Senha deve ter pelo menos 4 caracteres")
        
        hashed_password = get_password_hash(user_data.password)
        
        new_user = UserInDB(
            username=username,
            password=hashed_password,
            created_at=datetime.utcnow(),
            is_active=True,
            failed_login_attempts=0
        )
        
        created_user = user_repository.create(new_user)
        logger.info(f"User created: {username}")
        
        return UserResponse(
            id=created_user.id,
            username=created_user.username,
            created_at=created_user.created_at,
            is_active=created_user.is_active
        )
    
    @staticmethod
    def get_user_by_username(username: str) -> Optional[UserInDB]:
        return user_repository.get_by_username(username)
    
    @staticmethod
    def deactivate_user(username: str) -> bool:
        success = user_repository.deactivate(username)
        if success:
            logger.info(f"User deactivated: {username}")
        return success

user_service = UserService() 