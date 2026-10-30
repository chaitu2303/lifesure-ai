import hashlib
import os
import secrets
from typing import Tuple

def hash_password(password: str, salt: str = None) -> Tuple[str, str]:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a secure random salt.
    Returns (hex_hash, hex_salt).
    """
    if salt is None:
        salt = secrets.token_hex(16)
    
    dk = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return dk.hex(), salt

def verify_password(password: str, hashed: str, salt: str) -> bool:
    """
    Verify password against stored PBKDF2 hash and salt using constant-time comparison.
    """
    check_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(check_hash, hashed)

