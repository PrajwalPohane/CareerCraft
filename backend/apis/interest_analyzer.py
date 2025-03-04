import random
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from typing import List
from groq import Groq

router = APIRouter()

# Initialize Groq API Client
api_key = "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"
client = Groq(api_key=api_key)

class QuestionResponse(BaseModel):
    question: str
    answer: str

class CareerAssessmentRequest(BaseModel):
    responses: List[QuestionResponse]

# Global variables for storing questions and responses
questions = []
responses = []
current_question_index = 0

@router.get("/generate_questions")
async def generate_mcq_questions():
    global questions, current_question_index, responses
    num_questions = 20

    user_prompt = f"""
    Generate exactly 20 career assessment questions for 10th-grade students.
    Each question must be unique and help assess career aptitude.

    Distribute questions across these categories:
    1. Academic Interests (4 questions)
    2. Personal Work Style (4 questions)
    3. Problem-Solving Approach (3 questions)
    4. Communication & Leadership (3 questions)
    5. Career Values & Goals (3 questions)
    6. Technical vs Creative (3 questions)

    Format each question exactly as shown:
    Question: What type of activities do you enjoy most?
    A) [Technical/Analytical option]
    B) [Creative/Artistic option]
    C) [Management/Leadership option]
    D) [Research/Scientific option]

    Requirements:
    - Exactly 20 questions
    - Each question must have 4 distinct options
    - Options should represent different career paths
    - Questions should be clear and age-appropriate
    - No duplicate questions or similar options

    Start each question with "Question:" and options with A), B), C), D)
    """

    try:
        response = client.chat.completions.create(
            messages=[{
                "role": "system",
                "content": "You are a career guidance expert creating an assessment for 10th-grade students."
            },
            {
                "role": "user",
                "content": user_prompt
            }],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=2000  # Ensure enough tokens for 20 questions
        )

        content = response.choices[0].message.content
        # Split by "Question:" to separate questions
        raw_questions = content.split('Question:')
        formatted_questions = []

        for q in raw_questions:
            if not q.strip():
                continue

            lines = [line.strip() for line in q.split('\n') if line.strip()]
            if len(lines) >= 5:  # Question + 4 options
                question_text = lines[0].strip()
                options = []
                
                for line in lines[1:]:
                    if line.startswith(('A)', 'B)', 'C)', 'D)')):
                        option_text = line[2:].strip()
                        options.append(option_text)

                if len(options) == 4:
                    formatted_questions.append({
                        'text': question_text,
                        'options': options
                    })

        # Ensure exactly 20 questions
        if len(formatted_questions) < 20:
            print(f"Generated only {len(formatted_questions)} questions, retrying...")
            return await generate_mcq_questions()
        
        # Take exactly 20 questions
        formatted_questions = formatted_questions[:20]

        # Debug output
        print(f"Successfully generated {len(formatted_questions)} questions")
        for i, q in enumerate(formatted_questions, 1):
            print(f"Question {i}: {q['text']}")

        current_question_index = 0
        responses = []
        return {"questions": formatted_questions}

    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate questions. Please try again."
        )

@router.get("/next_question")
async def get_next_question():
    global current_question_index
    if current_question_index < len(questions):
        question = questions[current_question_index]
        return {"question": question}
    else:
        return {"message": "No more questions available."}

@router.post("/submit_answer")
async def submit_answer(response: QuestionResponse):
    global current_question_index
    if current_question_index < len(questions):
        responses.append(response)
        current_question_index += 1
        return {"message": "Answer submitted successfully."}
    else:
        raise HTTPException(status_code=400, detail="No question to answer.")

@router.post("/analyze_responses")
async def analyze_mcq_responses(request: CareerAssessmentRequest):
    user_prompt = """Based on the student's responses to the career assessment, provide a comprehensive analysis in the following format:

    1. Primary Career Clusters:
       - Identify top 3 career fields that match their interests
       - Explain why each field suits their preferences
       - List specific job roles within each field

    2. Academic Path Recommendations:
       - Suggested streams for 11th & 12th
       - Recommended undergraduate programs
       - Required entrance exams

    3. Skill Development Roadmap:
       - Essential skills to start developing now
       - Recommended activities and projects
       - Online courses and resources

    4. Preparation Timeline:
       - Immediate steps (next 6 months)
       - Short-term goals (1-2 years)
       - Long-term planning

    Student's Responses:
    """

    for i, response in enumerate(request.responses, 1):
        user_prompt += f"\nQ{i}: {response.question}\nSelected: {response.answer}\n"

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": user_prompt}],
            model="llama3-70b-8192",
            temperature=0.7
        )
        return {"recommendations": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing responses: {e}")

@router.post("/analyze_ssc_responses")
async def analyze_ssc_responses(request: CareerAssessmentRequest):
    user_prompt = "Based on the following responses, suggest the most suitable career paths:\n\n"

    for i, response in enumerate(request.responses, 1):
        user_prompt += f"**Question {i}:** {response.question}\n"
        user_prompt += f"**Selected Option:** {response.answer}\n\n"

    user_prompt += """
    Provide:
    1. The top 3 most suitable career fields
    2. The reasoning behind each recommendation
    3. The key skills required for each recommended career
    4. Suggested next steps for students
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": user_prompt}],
            model="llama3-70b-8192",
            temperature=0.7
        )
        return {"recommendations": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing responses: {e}")

# Run the FastAPI application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000)