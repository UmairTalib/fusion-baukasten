from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
import bcrypt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "b4f2c9e6d0a7f1e4b8a2c5d9f3e6a0c4b7f1e8d2c5a9f3e6b0c4a7d1e8f2c5b9")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None, token_type: str = "access"
) -> str:
    from datetime import timezone
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject), "type": token_type}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

