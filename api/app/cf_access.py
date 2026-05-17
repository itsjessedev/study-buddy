"""Cloudflare Access authentication helpers."""

import secrets
import time
import urllib.request
from typing import Any

from fastapi import HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_settings
from app.models import User
from app.utils.security import hash_password

_JWKS_CACHE: dict[str, Any] | None = None
_JWKS_CACHE_EXPIRES_AT = 0.0
_JWKS_CACHE_SECONDS = 3600


def allowed_cf_access_emails() -> set[str]:
    """Return normalized emails that are allowed to map to the Study Buddy account."""
    settings = get_settings()
    return {
        email.strip().lower()
        for email in settings.cf_access_allowed_emails.split(",")
        if email.strip()
    }


def cf_access_is_enabled() -> bool:
    """Return true when Cloudflare Access auth is enabled."""
    return get_settings().cf_access_enabled


def cf_access_is_configured() -> bool:
    """Return true when required Cloudflare Access settings are present."""
    settings = get_settings()
    return bool(
        settings.cf_access_team_domain
        and settings.cf_access_audience
    )


def require_cf_access_configured() -> None:
    """Fail closed when Cloudflare Access is enabled without required settings."""
    if cf_access_is_enabled() and not cf_access_is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cloudflare Access is enabled but not configured",
        )


def _jwks_url() -> str:
    settings = get_settings()
    team_domain = settings.cf_access_team_domain.rstrip("/")
    return f"{team_domain}/cdn-cgi/access/certs"


def _get_jwks() -> dict[str, Any]:
    global _JWKS_CACHE, _JWKS_CACHE_EXPIRES_AT

    now = time.time()
    if _JWKS_CACHE and now < _JWKS_CACHE_EXPIRES_AT:
        return _JWKS_CACHE

    with urllib.request.urlopen(_jwks_url(), timeout=5) as response:
        data = response.read()

    import json

    _JWKS_CACHE = json.loads(data)
    _JWKS_CACHE_EXPIRES_AT = now + _JWKS_CACHE_SECONDS
    return _JWKS_CACHE


def verify_cf_access_jwt(token: str) -> dict[str, Any]:
    """Verify a Cloudflare Access JWT and return its claims."""
    require_cf_access_configured()
    settings = get_settings()

    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Cloudflare Access token",
        )

    key_id = header.get("kid")
    key = next((item for item in _get_jwks().get("keys", []) if item.get("kid") == key_id), None)
    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unknown Cloudflare Access signing key",
        )

    try:
        return jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.cf_access_audience,
            issuer=settings.cf_access_team_domain.rstrip("/"),
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Cloudflare Access token",
        )


def get_cf_access_email(request: Request) -> str:
    """Verify the Access JWT on the request and return the normalized email claim."""
    token = request.headers.get("Cf-Access-Jwt-Assertion")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Cloudflare Access token",
        )

    claims = verify_cf_access_jwt(token)
    email = str(claims.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cloudflare Access token did not include an email",
        )

    if email not in allowed_cf_access_emails():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email is not allowed for this Study Buddy account",
        )

    return email


def get_or_create_cf_access_user(db: Session, email: str) -> User:
    """Map all allowed Cloudflare Access emails to one local Study Buddy user."""
    settings = get_settings()
    username = settings.cf_access_account_username
    user = db.query(User).filter(User.username == username).first()
    if user:
        return user

    user = User(
        username=username,
        first_name=settings.cf_access_account_first_name,
        password_hash=hash_password(secrets.token_urlsafe(32)),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
