from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from apify_client import ApifyClient
from typing import Generator
from fastapi.middleware.cors import CORSMiddleware

# Initialize the ApifyClient with your API token
API_TOKEN = "apify_api_o1iW3ernJlJBO3BZMoLFrDsS4gMgz01hrxDv"  # Replace with your actual Apify API token
client = ApifyClient(API_TOKEN)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobSearchRequest(BaseModel):
    position: str
    country: str
    location: str
    maxItems: int

@app.post("/search_jobs")
def search_jobs(request: JobSearchRequest) -> Generator[dict, None, None]:
    # Prepare the Actor input
    run_input = {
        "position": request.position,
        "country": request.country,
        "location": request.location,
        "maxItems": request.maxItems,
        "parseCompanyDetails": False,
        "saveOnlyUniqueItems": True,
        "followApplyRedirects": False,
    }

    print("\nFetching jobs... Please wait.")

    # Run the Actor and wait for it to finish
    run = client.actor("hMvNSpz3JnHgl5jkh").call(run_input=run_input)

    # Fetch and yield job results from the dataset
    jobs_found = False
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        jobs_found = True
        # Handle salary with proper formatting
        salary = item.get('salary')
        salary_str = "N/A"
        if salary is not None and str(salary).strip():
            salary_str = str(salary).strip()

        job = {
            "title": item.get('positionName', 'N/A'),
            "company": item.get('company', 'N/A'),
            "location": item.get('location', 'N/A'),
            "salary": salary_str,
            "url": item.get('url', '#')
        }
        yield job

    if not jobs_found:
        raise HTTPException(status_code=404, detail="No jobs found for your search criteria.")

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
