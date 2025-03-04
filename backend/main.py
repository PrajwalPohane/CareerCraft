from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apis import interest_analyzer, Resume_mock, llm_resume, general
from routes import job_routes

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interest_analyzer.router, prefix="/api/interest", tags=["interest"])
app.include_router(Resume_mock.router, prefix="/api/mock", tags=["mock"])
app.include_router(llm_resume.router, prefix="/api/llm", tags=["llm"])
app.include_router(general.router, prefix="/api/career", tags=["career"])
app.include_router(job_routes.router, prefix="/api", tags=["jobs"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 