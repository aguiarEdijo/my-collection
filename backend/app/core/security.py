from datetime import datetime, timedelta
from typing import Dict
import logging

security_logger = logging.getLogger("security")

class SecurityManager:
    def __init__(self, max_attempts: int = 10, lockout_minutes: int = 5):
        self.max_attempts = max_attempts
        self.lockout_duration = timedelta(minutes=lockout_minutes)
    
    def is_account_locked(self, user) -> bool:
        if not user:
            return False
        return user.locked_until and user.locked_until > datetime.utcnow()
    
    def record_failed_login(self, user) -> None:
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= self.max_attempts:
            user.locked_until = datetime.utcnow() + self.lockout_duration
            security_logger.warning(f"Account locked: {user.username}")
    
    def reset_failed_attempts(self, user) -> None:
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()

class RateLimiter:
    def __init__(self):
        self._storage: Dict[str, list] = {}
    
    def check_limit(self, key: str, max_requests: int, window_minutes: int) -> bool:
        current_time = datetime.utcnow().timestamp()
        window_start = current_time - (window_minutes * 60)
        
        if key not in self._storage:
            self._storage[key] = []
        
        self._storage[key] = [t for t in self._storage[key] if t > window_start]
        
        if len(self._storage[key]) >= max_requests:
            return False
        
        self._storage[key].append(current_time)
        return True

security_manager = SecurityManager()
rate_limiter = RateLimiter() 