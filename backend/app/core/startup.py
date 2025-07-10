from app.models.user import UserInDB
from app.repositories.user_repository import user_repository
from app.utils.security import get_password_hash
from datetime import datetime
import logging

logger = logging.getLogger("startup")

def init_test_environment():
    if not user_repository.get_all():
        try:
            admin_password = "TestAdmin123!"
            hashed_password = get_password_hash(admin_password)
            
            admin_user = UserInDB(
                username="admin",
                password=hashed_password,
                created_at=datetime.utcnow(),
                is_active=True,
                failed_login_attempts=0
            )
            
            user_repository.create(admin_user)
            logger.info("✅ Admin user created for test environment")
            logger.info("📋 Test credentials: admin / TestAdmin123!")
            
        except Exception as e:
            logger.error(f"Failed to create admin user: {e}") 