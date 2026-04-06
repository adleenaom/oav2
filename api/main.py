from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import (
    auth_router,
    listings_router,
    bundles_router,
    plans_router,
    daily_videos_router,
    credits_router,
    progress_router,
    search_router,
    creators_router,
)

app = FastAPI(
    title="OpenAcademy API",
    description="Backend API for the OpenAcademy PWA",
    version="0.1.0",
)

# CORS — allow React dev server and Coolify deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Vite dev
        "http://localhost:3000",    # Alternative
        "http://localhost:4173",    # Vite preview
        "*",                        # TODO: restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(bundles_router)
app.include_router(plans_router)
app.include_router(daily_videos_router)
app.include_router(credits_router)
app.include_router(progress_router)
app.include_router(search_router)
app.include_router(creators_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"status": "ok", "app": "OpenAcademy API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
