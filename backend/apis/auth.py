from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# This is a temporary solution. In production, you should use a database
TEMP_USERS = {
    "test@example.com": {
        "password": "test123",
        "name": "Test User"
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    user = TEMP_USERS.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    # In production, you should use proper JWT tokens
    return {
        "token": "test_token",
        "user": {
            "email": request.email,
            "name": user["name"]
        }
    } 