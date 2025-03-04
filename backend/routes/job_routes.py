from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from apify_client import ApifyClient
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize the ApifyClient with your API token
API_TOKEN = "apify_api_o1iW3ernJlJBO3BZMoLFrDsS4gMgz01hrxDv"
client = ApifyClient(API_TOKEN)

class JobSearchRequest(BaseModel):
    position: str
    country: str
    location: str
    maxItems: int

class Job(BaseModel):
    title: str
    company: str
    location: str
    salary: Optional[str] = "N/A"
    applicationUrl: str

@router.post("/search_jobs", response_model=List[Job])
async def search_jobs(request: JobSearchRequest):
    try:
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

        print(f"\nFetching jobs for position: {request.position}...")

        # Run the Actor and wait for it to finish
        run = client.actor("hMvNSpz3JnHgl5jkh").call(run_input=run_input)

        # Fetch all jobs from the dataset
        jobs = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            # Handle salary with proper formatting
            salary = item.get('salary')
            salary_str = "N/A"
            if salary is not None and str(salary).strip():
                salary_str = str(salary).strip()
            
            job = Job(
                title=str(item.get('positionName', 'N/A')),
                company=str(item.get('company', 'N/A')),
                location=str(item.get('location', 'N/A')),
                salary=salary_str,
                applicationUrl=str(item.get('url', '#'))
            )
            jobs.append(job)

        if not jobs:
            raise HTTPException(status_code=404, detail="No jobs found for your search criteria.")

        return jobs

    except Exception as e:
        logger.error(f"Error in search_jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 
