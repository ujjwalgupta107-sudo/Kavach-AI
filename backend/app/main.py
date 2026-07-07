import uuid
from fastapi import FastAPI, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import KavachException, kavach_exception_handler, global_exception_handler
from app.db.session import engine
from app.api.v1.endpoints import auth, cases, intelligence, analysis, assistant, evidence, dashboard, alerts, clusters, geo, live_analysis, public_analysis

# Setup logging
setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="KAVACH AI Backend API",
)

# Static files for local uploads removed for security. 
# Use /api/v1/evidence/{id}/download instead.

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
api_router = APIRouter(prefix=settings.API_V1_PREFIX)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["Evidence"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["Intelligence"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["AI Analysis"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Assistant"])
from app.api.v1.endpoints import agents
api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(clusters.router, prefix="/clusters", tags=["Clusters"])
api_router.include_router(geo.router, prefix="/geo", tags=["Geographic Intelligence"])
api_router.include_router(live_analysis.router, prefix="/analysis/live", tags=["Live Analysis"])
api_router.include_router(public_analysis.router, prefix="/public", tags=["Public"])

app.include_router(api_router)

# Exception handlers
app.add_exception_handler(KavachException, kavach_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response

@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check to verify application process is alive."""
    return {"status": "ok", "app": settings.APP_NAME, "environment": settings.APP_ENV}

@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Verify database connection is functioning."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return {
        "status": "ready" if db_status == "ok" else "not_ready",
        "database": db_status
    }
