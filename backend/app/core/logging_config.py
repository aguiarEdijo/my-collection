import logging
import sys

def setup_logging():
    """Configura logging para o ambiente de teste"""
    # Configuração básica
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
        ]
    )
    
    # Loggers específicos
    loggers = [
        "security",
        "auth_service", 
        "user_service",
        "auth_routes",
        "todos",
        "startup",
        "audit"
    ]
    
    for logger_name in loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.INFO)
    
    # Logger de auditoria com nível mais baixo para capturar tudo
    audit_logger = logging.getLogger("audit")
    audit_logger.setLevel(logging.DEBUG) 