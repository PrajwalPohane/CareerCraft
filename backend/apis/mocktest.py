import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from groq import Groq

# Initialize Groq API Client
api_key = "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"  # Replace with your actual API key
client = Groq(api_key=api_key)

app = FastAPI()

class QuestionResponse(BaseModel):
    question: str
    answer: str

class GenerateQuestionsRequest(BaseModel):
    topic: str

class EvaluateResponsesRequest(BaseModel):
    responses: List[QuestionResponse]

# Function to generate structured interview questions for a given topic
def generate_questions(topic: str):
    min_questions = 10
    max_questions = 20
    num_questions = random.randint(min_questions, max_questions)

    user_prompt = f"""
    Generate {num_questions} high-quality interview questions related to {topic}.
    - Ensure questions are relevant to industry standards.
    - Do not include labels like "Scenario-based" or "Theoretical."
    - Keep them structured, challenging, and precise.
    - Avoid open-ended or vague questions.
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": user_prompt}],
            model="llama3-70b-8192",
            temperature=0.7
        )
        questions = response.choices[0].message.content.split("\n")
        questions = [q.strip() for q in questions if q.strip()]
        return questions[:num_questions]
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []

# Function to evaluate responses after the interview is completed
def evaluate_all_responses(responses: List[Dict[str, str]]):
    user_prompt = "Evaluate the following interview responses:\n\n"

    for i, response in enumerate(responses, 1):
        user_prompt += f"**Question {i}:** {response['question']}\n"
        user_prompt += f"**User's Answer:** {response['answer']}\n\n"

    user_prompt += """
    Provide:
    1. A detailed score (out of 10) for each response.
    2. Strengths of the user’s answers.
    3. Areas for improvement with actionable suggestions.
    4. A final summary on overall performance and recommendations.
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": user_prompt}],
            model="llama3-70b-8192",
            temperature=0.7
        )
        feedback = response.choices[0].message.content
        return feedback
    except Exception as e:
        print(f"Error evaluating responses: {e}")
        return "Unable to evaluate responses."

@app.post("/generate_questions")
async def generate_questions_endpoint(request: GenerateQuestionsRequest):
    questions = generate_questions(request.topic)
    if not questions:
        raise HTTPException(status_code=500, detail="Failed to generate questions")
    return {"questions": questions}

@app.post("/evaluate_responses")
async def evaluate_responses_endpoint(request: EvaluateResponsesRequest):
    feedback = evaluate_all_responses(request.responses)
    return {"feedback": feedback}

# Run the FastAPI application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
