from groq import Groq
from fastapi import APIRouter
from pydantic import BaseModel, Field
from fastapi import HTTPException
from typing import Optional

router = APIRouter()

api_key = "YOUR_GROQ_API_KEY"

if not api_key:
    raise ValueError("API key not found in Colab secrets. Please ensure that the 'GROQ_API_KEY' is added to the Colab secrets.")


def initialize_groq_client(api_key):
    try:
        return Groq(api_key=api_key)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        return None
    
def generate_career_roadmap(client, user_education):    
    if user_education.lower() in ['ssc', '10th', '10']:
      return ("You are not eligible for a career roadmap")

    elif user_education.lower() in ['hsc', '12th', '12']:
      user_stream=input("Enter your stream: ")

      if user_stream.lower() in ['science', 'science stream', 'science stream']:
        specialisation=input("Enter your specialisation(PCM, PCB, PCMB): ")
      else:
         specialisation= "No specialisation"

      user_subjects_of_interest=input("Enter your field of interest: ")
      user_academic_performance=input("Enter your academic performance: ")
      user_extracurricular_activities=input("Enter your extracurricular activities: ")
      user_career_aspirations=input("Enter your career aspirations: ")

      system_prompt = """You are an AI Career Advisor with expertise in career development, job market trends, and career strategies.  
        Your task is to generate a **structured and personalized career roadmap** for a **12th-grade student** who is **struggling to decide on career goals**.  

        ### **Approach for Career Guidance:**  
        1. **Assess the Student's Stream & Interests:**  
          - Identify the student's **current stream**: **Science, Arts, or Commerce**.  
          - Consider their **academic strengths, subjects of interest, and extracurricular activities**.  
          - If the student is completely unsure, provide **broad recommendations** that allow flexibility.

        2. **Suggest Career Pathways Based on Stream:**  
          - **Science:** Engineering, Medical, IT, Data Science, Research, etc.  
          - **Commerce:** Finance, Business, Marketing, Accounting, Economics, etc.  
          - **Arts:** Media, Psychology, Design, Law, Civil Services, etc.  

        3. **Match Career Paths with Industry Growth:**  
          - Recommend career options based on **job demand, salary potential, and future industry trends**.  
          - Suggest **higher education options, alternative career pathways, and required skills**.  

        4. **Provide a Structured Career Roadmap:**  
          - **Short-term Goals (0-2 years):** Higher education options, entry-level skills, and certifications.  
          - **Mid-term Goals (3-5 years):** Internships, career transitions, and specialization options.  
          - **Long-term Goals (6+ years):** Career growth, leadership roles, and entrepreneurial opportunities.  

        ### **Guidelines for Response Generation:**  
        - **Tailor Suggestions Based on Stream:** Ensure recommendations align with **Science, Commerce, or Arts**.  
        - **Use Simple and Relatable Language:** The roadmap should be clear for a 12th-grade student.  
        - **No Unnecessary Jargon:** Explain career options in a way that is easy to understand.  
        - **Provide Actionable Steps:** The roadmap should help the student **confidently choose a career path**.  

        ### **Expected Output Format:**  
        The AI should generate the response strictly in the following JSON format:  
        {
          "student_details": {
            "stream": "Science/Commerce/Arts",
            "specialisation": "PCM/PCB/PCMB",
            "academic_performance": "Details about student's academic performance",
            "subjects_of_interest": ["Subject 1", "Subject 2"],
            "extracurricular_activities": ["Activity 1", "Activity 2"],
            "career_aspirations": ["Aspiration 1", "Aspiration 2"]
          },
          "career_roadmap": {
            "short_term_goals": {
              "timeline": "0-2 years",
              "higher_education_options": ["Degree 1", "Diploma 1"],
              "skills_to_develop": ["Skill A", "Skill B"],
              "certifications": ["Certification 1", "Certification 2"],
              "exploratory_projects": ["Project 1", "Project 2"]
            },
            "mid_term_goals": {
              "timeline": "3-5 years",
              "career_transitions": ["Transition 1", "Transition 2"],
              "internships_and_experience": ["Internship 1", "Job Shadowing 1"],
              "advanced_skills": ["Skill X", "Skill Y"],
              "networking_opportunities": ["Industry Event 1", "Mentorship Program"]
            },
            "long_term_goals": {
              "timeline": "6+ years",
              "career_options": ["Career 1", "Career 2"],
              "specialization_paths": ["Specialization 1", "Specialization 2"],
              "leadership_roles": ["Leadership Role 1", "Leadership Role 2"],
              "entrepreneurial_and_research_opportunities": ["Start a Business", "Pursue PhD"]
            }
          }
        }
        """
      user_prompt = f"""The student has completed **12th grade** and is struggling to decide on their **career goals**.  
        Your task is to **guide them through a structured decision-making process** based on their **stream (Science, Commerce, or Arts)**, academic strengths, and interests.  

        ### **Student's Background:**  
        - **Stream:** {user_stream} (Science/Commerce/Arts)
        - **Specialisation** {specialisation}
        - **Subjects of Interest:** {user_subjects_of_interest}
        - **Academic Performance:** {user_academic_performance}
        - **Extracurricular Activities:** {user_extracurricular_activities}
        - **Career Aspirations:** {user_career_aspirations}

        ### **Instructions for Generating the Career Roadmap:**  
        1. **Analyze** the student's **stream, subjects of interest, specialisation  and extracurricular activities**.  
        2. **Suggest career pathways relevant to their stream** (e.g., Science → Engineering/Medicine, Commerce → Finance/Business, Arts → Media/Psychology).  
        3. **Match potential career paths** with **industry demand and future opportunities**.  
        4. **Provide a structured roadmap in JSON format**:  
          - **Short-term Goals (0-2 years):** Higher education, foundational skills, and certifications.  
          - **Mid-term Goals (3-5 years):** Internships, career transitions, and advanced skills.  
          - **Long-term Goals (6+ years):** Career progression, leadership, and specialization.  
        5. **Ensure JSON Output Format Strictly Matches the Given Structure.**  

        Strictly **avoid any explanations** in the output and generate only the structured JSON format.  
        """
  
    else:
      system_prompt = """You are an AI Career Advisor with expertise in career development, job market trends, and professional growth strategies. Your task is to generate a structured, highly personalized career roadmap based on the user's background. The ultimate goal of the roadmap is to get an entry-level job assumming that the user is completely fresher in the market.

        The roadmap should be designed by **matching the user's education, skills, and experience with their stated career interests** while considering industry best practices.

        **Consider the user's knowledge by his education level before designing the roadmap.**

                ### **Structure of the Career Roadmap:**
                1. **Short-term Goals (0-2 years)**
                  - Identify **entry-level job roles** or internships that align with the user's background.
                  - Recommend **essential beginner skills** and certifications that improve job readiness.
                  - Suggest **relevant projects, hackathons, or freelancing opportunities** to build a strong portfolio.

                2. **Mid-term Goals (3-5 years)**
                  - Outline **career progression steps** such as switching to specialized roles or transitioning to related fields.
                  - Identify **in-demand intermediate skills** needed for professional growth.
                  - Recommend **networking strategies** (LinkedIn engagement, mentorship, industry events).
                  - Suggest **higher education options (e.g., master's, professional certifications)** if beneficial.

                3. **Long-term Goals (6+ years)**
                  - Suggest **advanced roles and leadership positions** that align with long-term interests.
                  - Identify **expert-level skills** and specialization pathways.
                  - Recommend **entrepreneurship or research opportunities**, if applicable.
                  - Provide **global career options**, including remote and international job prospects.

                ### **Guidelines for Generating the Roadmap:**
                - Prioritize **realistic, industry-relevant steps** that lead the user towards their **ideal career path**.
                - Clearly **justify** each recommendation based on **job market demand, required skills, and potential salary growth**.
                - If the user's background is **not directly aligned with their career interest**, suggest **bridge roles and skill transition paths**.
                - Ensure recommendations are **structured, concise, and easy to follow**.


            Always provide the output in the provided json format:
            {
              "user_details": {
                "education": "User's education details here",
                "skills": ["Skill 1", "Skill 2", "Skill 3"],
                "experience": "User's work experience details here",
                "career_interests": ["Interest 1", "Interest 2"]
              },
              "career_roadmap": {
                "short_term_goals": {
                  "timeline": "0-2 years",
                  "recommended_roles": ["Entry-level Role 1", "Entry-level Role 2"],
                  "skills_to_develop": ["Skill A", "Skill B"],
                  "certifications": ["Certification 1", "Certification 2"],
                  "projects_and_experience": ["Project 1", "Internship 1"],
                  "networking_strategies": ["Join LinkedIn groups", "Attend industry events"]
                },
                "mid_term_goals": {
                  "timeline": "3-5 years",
                  "career_transitions": ["Specialized Role 1", "Specialized Role 2"],
                  "advanced_skills": ["Skill X", "Skill Y"],
                  "higher_education": ["Master's in XYZ", "Professional Certification ABC"],
                  "networking_and_growth": ["Mentorship programs", "Speaking at conferences"]
                },
                "long_term_goals": {
                  "timeline": "6+ years",
                  "leadership_positions": ["Senior Role 1", "Managerial Role 2"],
                  "expert_skills": ["Expert Skill 1", "Expert Skill 2"],
                  "specialization_paths": ["Niche 1", "Niche 2"],
                  "entrepreneurship_and_research": ["Start a business", "Pursue PhD"]
                }
              }
            }
        """
      specialisation=input("Enter your specialisation: ") or "No specialisation"
      user_skills=input("Enter your skills: ")
      user_experience=input("Enter your work experience: ")
      user_interests=input("Enter your career interests: ")

      user_prompt = f"""The user is seeking a personalized career roadmap that aligns their **education, skills, experience, and career interests** with suitable **job roles and career paths**.
            ### **User's Background:**
            - **Education:** {user_education}
            - **Specialisation:** {specialisation}
            - **Skills:** {user_skills}
            - **Work Experience:** {user_experience}
            - **Career Interests:** {user_interests}

            ### **Instructions for Generating the Career Roadmap:**
            1. **Analyze** the user's education and skills to determine **best-fit job roles** that match their career interests.
            2. If a direct match is **not possible**, suggest a **realistic transition strategy** (e.g., additional certifications, skill-building, side projects).
            3. Structure the roadmap into **Short-term, Mid-term, and Long-term Goals**, ensuring each step logically progresses towards the user's career aspirations.
            4. Provide **specific action items** such as:
              - Job roles to aim for.
              - Skills to develop.
              - Certifications or courses to complete.
              - Networking strategies and job search tactics.
              - Leadership and specialization pathways.

            Ensure that the roadmap is **clear, actionable, and realistic**, helping the user achieve their career goals effectively.


            Strictly avoid the explanation of the roadmap in the output. Also, avoid any other string in the output except the json format.
        """


    try:
        response = client.chat.completions.create(
            messages=[
              {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0
        )
        career_roadmap = response.choices[0].message.content
        return career_roadmap

    except Exception as e:
        print(f"Error generating career roadmap: {e}")
        return None

# Define request model
class UserInput(BaseModel):
    education: str
    specialisation: str = "No specialisation"
    skills: str = ""
    experience: str = ""
    interests: str = ""

@router.post("/generate-roadmap")
async def generate_roadmap(user_input: UserInput):
    client = initialize_groq_client(api_key)
    if not client:
        raise HTTPException(status_code=500, detail="Failed to initialize Groq client.")

    user_prompt = f"""
    Create a detailed career roadmap for a {user_input.education} with the following profile:
    
    Background:
    - Specialization: {user_input.specialisation}
    - Skills: {user_input.skills}
    - Experience: {user_input.experience if user_input.experience else 'None specified'}
    - Career Interests: {user_input.interests}

    Provide detailed career guidance in the following format:

    1. Career Paths and Opportunities:
       - Recommended career paths based on profile
       - Industry trends and demand
       - Potential roles and positions
       - Salary ranges and growth prospects

    2. Skill Development Plan:
       - Technical skills to acquire/improve
       - Soft skills to develop
       - Certifications and courses
       - Timeline for skill acquisition

    3. Educational Advancement:
       - Further education recommendations
       - Specialized courses or training
       - Professional certifications
       - Research opportunities

    4. Experience Building:
       - Project recommendations
       - Internship opportunities
       - Networking strategies
       - Portfolio development
       - Industry connections

    5. Timeline and Milestones:
       - Short-term goals (0-6 months)
       - Medium-term goals (6-18 months)
       - Long-term career progression (2-5 years)
       - Key performance indicators

    6. Industry-Specific Guidance:
       - Market demand
       - Technology trends
       - Required certifications
       - Career advancement paths
    """

    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a career guidance expert providing detailed roadmaps for career development."
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.7
        )

        recommendations = response.choices[0].message.content.strip()
        return {"recommendations": recommendations}

    except Exception as e:
        print(f"Error generating career roadmap: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate career roadmap: {str(e)}"
        )

@router.post("/analyze_hsc")
async def analyze_hsc(request: dict):
    client = initialize_groq_client(api_key)
    if not client:
        raise HTTPException(status_code=500, detail="Failed to initialize Groq client.")

    user_prompt = f"""Generate a comprehensive career guidance plan for an HSC (12th) student:

    Student Profile:
    - Stream: {request.get('stream', '')}
    - Specialization: {request.get('specialization', '')}
    - Interests: {request.get('interests', '')}
    - Academic Performance: {request.get('academicPerformance', '')}
    - Activities: {request.get('extracurricular', '')}
    - Career Goals: {request.get('careerAspiration', '')}

    Provide guidance in the following format:

    1. Recommended Course Paths:
       - List top 3 undergraduate programs matching their profile
       - Required entrance exams and preparations
       - Top institutions offering these courses

    2. Career Opportunities After Graduation:
       - Potential career paths in chosen field
       - Industry demand and growth prospects
       - Expected salary ranges

    3. Skill Development Plan:
       - Essential skills to develop during studies
       - Recommended certifications or additional courses
       - Internship opportunities to pursue

    4. Alternative Career Paths:
       - Other viable options based on interests
       - Required preparations for alternative paths
       - Pros and cons of each option
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": user_prompt}],
            model="llama3-70b-8192",
            temperature=0.7
        )
        return {"recommendations": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating guidance: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000)
