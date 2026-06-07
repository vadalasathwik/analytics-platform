import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from typing import Dict, List


class InMemoryRateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        
        # Keep only timestamps within the current sliding window
        self.history[key] = [t for t in self.history[key] if t > window_start]
        
        if len(self.history[key]) < self.requests_limit:
            self.history[key].append(now)
            return True
        return False


# Global rate limiter instances
login_rate_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)      # 5 requests per minute
ingest_rate_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=10)    # 10 requests per 10 seconds


async def check_login_rate_limit(request: Request):
    # Retrieve client host IP for rate limiting
    client_ip = request.client.host if request.client else "unknown_ip"
    if not login_rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )


async def check_ingest_rate_limit(request: Request):
    # Retrieve API key from headers to rate limit per tenant key
    x_api_key = request.headers.get("x-api-key")
    if not x_api_key:
        return  # Let track_event handle missing header error (422/400)

    if not ingest_rate_limiter.is_allowed(x_api_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Too many ingestion requests."
        )
