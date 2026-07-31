from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router

app = FastAPI(title="Fusion-Baukasten API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Fusion-Baukasten API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
