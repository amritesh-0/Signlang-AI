from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import routes

app = FastAPI(title="SignAI Pipeline API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Include API routes
app.include_router(routes.router)

# Mount static files for outputs
os.makedirs("outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

@app.get("/")
def read_root():
    return {"message": "SignAI Backend is running"}
