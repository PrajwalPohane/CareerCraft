import os
import json
import random
import re
from fastapi import FastAPI, HTTPException, UploadFile, File, APIRouter
from pydantic import BaseModel
from typing import List, Dict
from groq import Groq

# Initialize Groq API Client
api_key = "YOUR_GROQ_API_KEY"  # Replace with your actual API key
client = Groq(api_key=api_key)

app = FastAPI()
router = APIRouter()

class QuestionResponse(BaseModel):
    question: str
    answer: str

class CareerAssessmentRequest(BaseModel):
    responses: List[QuestionResponse]

class TestRequest(BaseModel):
    topic: str
    skills: List[str]

class TestResponse(BaseModel):
    responses: List[Dict]
    topic: str
    skills: List[str]

class ResumeRequest(BaseModel):
    job_title: str
    resume_data: Dict

questions = []
responses = []
current_question_index = 0

# Function to load resume data from JSON file
def load_resume_data(json_file):
    try:
        with open(json_file, "r", encoding="utf-8") as file:
            resume_data = json.load(file)
        return resume_data
    except Exception as e:
        print(f"Error loading resume data: {e}")
        return None

# Function to generate structured MCQs with proper answer choices
def generate_mcq_questions(topic, skills):
    """Generate MCQ questions based on job role and skills."""
    try:
        # Sanitize inputs
        topic = str(topic).strip()
        skills = [str(skill).strip() for skill in skills if skill]

        user_prompt = f"""
            Create 10 multiple-choice questions to assess a candidate for the position of {topic}.
            Focus on these skills: {', '.join(skills)}

            Return the questions in this exact JSON format:
            [
                {{
                    "id": "q1",
                    "question": "Sample question text?",
                    "options": [
                        {{ "id": "a", "text": "First option" }},
                        {{ "id": "b", "text": "Second option" }},
                        {{ "id": "c", "text": "Third option" }},
                        {{ "id": "d", "text": "Fourth option" }}
                    ]
                }}
            ]

            Important:
            1. Return ONLY the JSON array
            2. Create exactly 10 questions
            3. Each question must have exactly 4 options
            4. Use the exact format shown above
            5. Make questions relevant to the position and skills
            """

        print("Sending prompt to LLM...")
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical interviewer. Respond only with the requested JSON array."
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.5
        )

        content = response.choices[0].message.content.strip()
        print("Received response from LLM")
        print(f"Raw response: {content[:200]}...")  # Print first 200 chars

        # Clean up the response
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0].strip()
        elif '```' in content:
            content = content.split('```')[1].strip()

        # Parse JSON
        try:
            questions = json.loads(content)
            print(f"Successfully parsed JSON with {len(questions)} questions")
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {str(e)}")
            print(f"Content causing error: {content}")
            raise Exception("Failed to parse LLM response as JSON")

        # Validate and format questions
        formatted_questions = []
        for i, q in enumerate(questions, 1):
            formatted_question = {
                "id": f"q{i}",
                "question": q.get("question", "").strip(),
                "options": []
            }
            
            # Format options
            options = q.get("options", [])
            if len(options) != 4:
                print(f"Question {i} has {len(options)} options instead of 4")
                continue
                
            for j, opt in enumerate(options):
                formatted_question["options"].append({
                    "id": chr(97 + j),  # a, b, c, d
                    "text": opt.get("text", "").strip()
                })
            
            formatted_questions.append(formatted_question)

        if len(formatted_questions) < 10:
            raise Exception(f"Only generated {len(formatted_questions)} valid questions, needed 10")

        return formatted_questions[:10]

    except Exception as e:
        print(f"Error in generate_mcq_questions: {str(e)}")
        raise Exception(f"Question generation failed: {str(e)}")

# Function to evaluate MCQ responses
def evaluate_mcq_responses(responses, topic, skills):
    user_prompt = f"Evaluate the following multiple-choice responses based on {topic} and the skills: {', '.join(skills)}.\n\n"

    for i, response in enumerate(responses, 1):
        user_prompt += f"**Question {i}:** {response['question']}\n"
        user_prompt += f"**User's Answer:** {response['answer']}\n"
        user_prompt += f"**Correct Answer:** {response['correct']}\n\n"

    user_prompt += f"""
    Provide:
    1. A total score out of {len(responses)}.
    2. A list of correct and incorrect answers.
    3. Explanation for each correct answer.
    4. Identify knowledge gaps between the resume skills and the expected skillset for {topic}.
    5. Final feedback and recommendations for improvement.
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

# Function to provide resume improvement suggestions
def suggest_resume_improvements(job_title, resume_data):
    user_prompt = f"""
    Given the job title "{job_title}" and the candidate's resume data:
    
    Resume Skills: {resume_data['Skills']}
    Resume Projects: {resume_data['Projects']}
    
    Identify missing skills, technologies, or experience gaps for the given job title.
    Suggest improvements in a structured way.
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": user_prompt}],
            model="llama3-70b-8192",
            temperature=0.7
        )
        suggestions = response.choices[0].message.content
        return suggestions
    except Exception as e:
        print(f"Error suggesting resume improvements: {e}")
        return "Unable to provide resume improvement suggestions."

@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        resume_data = json.loads(contents)
        return {"message": "Resume uploaded successfully", "resume_data": resume_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error uploading resume: {e}")

@router.post("/generate_questions")
async def generate_questions(request: TestRequest):
    try:
        print(f"Received request - Topic: {request.topic}, Skills: {request.skills}")
        
        if not request.topic or not request.skills:
            raise HTTPException(
                status_code=400,
                detail="Both topic and skills are required"
            )

        # Add default skills if none provided
        if len(request.skills) == 0:
            request.skills = ["general knowledge", "basic concepts"]

        questions = generate_mcq_questions(request.topic, request.skills)
        print(f"Generated {len(questions)} questions successfully")
        return {"questions": questions}

    except Exception as e:
        print(f"Error in generate_questions endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate questions: {str(e)}"
        )

@router.post("/evaluate_responses")
async def evaluate_responses(request: TestResponse):
    try:
        print(f"Evaluating responses for {request.topic}")
        print(f"Responses received: {request.responses}")

        formatted_responses = []
        for response in request.responses:
            formatted_responses.append({
                "question": response["question"],
                "selected_answer": response["answer"],
                "question_id": response["questionId"],
                "option_id": response["selectedOptionId"]
            })

        evaluation_prompt = f"""
        You are a technical interviewer evaluating a candidate's responses for a {request.topic} position.
        Skills being assessed: {', '.join(request.skills)}

        Questions and Answers:
        {json.dumps(formatted_responses, indent=2)}

        Provide a detailed evaluation in this EXACT JSON format, with no additional text:
        {{
            "overall_score": "7/10",
            "score_percentage": "70%",
            "strengths": [
                "Strong understanding of core concepts",
                "Good problem-solving approach"
            ],
            "areas_for_improvement": [
                "Need to strengthen knowledge in X",
                "Could improve understanding of Y"
            ],
            "learning_resources": [
                {{
                    "topic": "Core Fundamentals",
                    "resources": [
                        "Resource 1: Description",
                        "Resource 2: Description"
                    ]
                }}
            ],
            "career_path_suggestions": [
                {{
                    "role": "Junior Developer",
                    "description": "Role description here",
                    "required_skills": ["skill1", "skill2"]
                }}
            ],
            "detailed_feedback": "Comprehensive analysis of performance"
        }}
        """

        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical interviewer. Respond only with valid JSON in the exact format requested."
                },
                {
                    "role": "user",
                    "content": evaluation_prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.5
        )

        content = response.choices[0].message.content.strip()
        
        # Clean up the response
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0].strip()
        elif '```' in content:
            content = content.split('```')[1].strip()

        feedback = json.loads(content)
        
        # Validate required fields
        required_fields = [
            "overall_score", "score_percentage", "strengths",
            "areas_for_improvement", "learning_resources",
            "career_path_suggestions", "detailed_feedback"
        ]
        
        missing_fields = [field for field in required_fields if field not in feedback]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

        return {"feedback": feedback}

    except Exception as e:
        print(f"Error in evaluate_responses: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate responses: {str(e)}"
        )

@router.post("/suggest_improvements")
async def suggest_improvements(request: ResumeRequest):
    try:
        suggestions = suggest_resume_improvements(request.job_title, request.resume_data)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the FastAPI application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
