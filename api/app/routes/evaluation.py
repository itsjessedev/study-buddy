"""Adaptive evaluation mode for comprehensive skill assessment."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import uuid
import random
import threading
import time

from app.database import get_db
from app.models import User, Skill, QuestionTemplate, Evaluation, EvaluationSkillResult
from app.schemas import QuestionResponse, AnswerSubmit
from app.auth import get_current_user
from app.generators import get_generator
from app.utils.answer_validation import answers_are_equivalent
from app.course_catalog import get_current_course_slugs

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

# In-memory storage for evaluation sessions with TTL
evaluation_sessions: Dict[str, Dict[str, Any]] = {}
SESSION_TTL_HOURS = 24  # Sessions expire after 24 hours


def cleanup_expired_sessions():
    """Remove expired sessions from memory."""
    now = datetime.utcnow()
    expired = []
    for session_id, session in evaluation_sessions.items():
        started_at = session.get("started_at")
        if started_at and (now - started_at) > timedelta(hours=SESSION_TTL_HOURS):
            expired.append(session_id)
        # Also clean up completed sessions older than 1 hour
        if session.get("completed") and started_at:
            if (now - started_at) > timedelta(hours=1):
                expired.append(session_id)

    for session_id in expired:
        evaluation_sessions.pop(session_id, None)


def start_cleanup_thread():
    """Start background thread to periodically clean up sessions."""
    def cleanup_loop():
        while True:
            time.sleep(3600)  # Run every hour
            cleanup_expired_sessions()

    thread = threading.Thread(target=cleanup_loop, daemon=True)
    thread.start()


# Start cleanup on module load
start_cleanup_thread()

# Difficulty levels (standardized to 3)
LEVELS = {
    1: "Foundations",
    2: "Proficient",
    3: "Mastery",
}
MAX_LEVEL = 3
MAX_ATTEMPTS_PER_LEVEL = 2  # Original + 1 retry

# Proficiency mapping based on highest level passed
PROFICIENCY_MAP = {
    0: "study",       # Failed level 1
    1: "developing",  # Passed level 1 only
    2: "proficient",  # Passed level 2
    3: "mastered",    # Passed level 3
}


def get_proficiency_label(highest_passed: int) -> str:
    """Get proficiency label from highest level passed."""
    return PROFICIENCY_MAP.get(highest_passed, "study")


def calculate_proficiency_score(highest_passed: int) -> float:
    """Calculate proficiency score (0-100) from highest level passed."""
    # 0 → 0%, 1 → 33%, 2 → 67%, 3 → 100%
    return (highest_passed / MAX_LEVEL) * 100


@router.post("/start")
def start_evaluation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Start a new adaptive evaluation session.

    Tests all skills starting at level 1, adapting based on performance.
    """
    # Get all skills with templates, grouped by subject
    skills = (
        db.query(Skill)
        .filter(Skill.slug.in_(get_current_course_slugs()))
        .order_by(Skill.subject, Skill.id)
        .all()
    )

    # Filter to skills with templates and organize by subject
    skills_by_subject: Dict[str, list] = {}
    skill_list = []

    for skill in skills:
        has_template = db.query(QuestionTemplate).filter(
            QuestionTemplate.skill_id == skill.id
        ).first()
        if has_template:
            if skill.subject not in skills_by_subject:
                skills_by_subject[skill.subject] = []
            skills_by_subject[skill.subject].append({
                "id": skill.id,
                "name": skill.name,
                "subject": skill.subject,
            })
            skill_list.append({
                "id": skill.id,
                "name": skill.name,
                "subject": skill.subject,
            })

    if not skill_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No skills with templates available for evaluation",
        )

    # Randomize skill order within each subject, keep subjects in curriculum order
    subject_order = [
        "College Math Foundations",
        "Algebra",
        "Functions",
        "Precalculus",
        "Trigonometry",
    ]
    ordered_subjects = [s for s in subject_order if s in skills_by_subject]
    # Add any subjects not in our predefined order
    for s in skills_by_subject:
        if s not in ordered_subjects:
            ordered_subjects.append(s)

    # Build evaluation queue: skills randomized within each subject
    evaluation_queue = []
    for subject in ordered_subjects:
        subject_skills = skills_by_subject[subject].copy()
        random.shuffle(subject_skills)
        evaluation_queue.extend(subject_skills)

    # Initialize skill states
    skill_states = {}
    for skill in evaluation_queue:
        skill_states[skill["id"]] = {
            "name": skill["name"],
            "subject": skill["subject"],
            "current_level": 1,
            "attempts_at_level": 0,
            "highest_passed": 0,
            "completed": False,
            "results": [],  # List of {level, passed, attempt}
        }

    # Calculate skills per subject for progress tracking
    skills_per_subject = {subject: len(skills) for subject, skills in skills_by_subject.items()}

    # Create session
    session_id = str(uuid.uuid4())
    evaluation_sessions[session_id] = {
        "user_id": current_user.id,
        "evaluation_queue": evaluation_queue,
        "current_skill_index": 0,
        "skill_states": skill_states,
        "skills_by_subject": skills_by_subject,
        "skills_per_subject": skills_per_subject,
        "subject_order": ordered_subjects,
        "active_question": None,
        "completed": False,
        "started_at": datetime.utcnow(),
        "total_skills": len(skill_list),
        "skills_completed": 0,
        "current_subject": ordered_subjects[0] if ordered_subjects else None,
        "subject_skills_completed": 0,
        "last_completed_subject": None,
    }

    return {
        "session_id": session_id,
        "total_skills": len(skill_list),
        "subjects": ordered_subjects,
        "skills_per_subject": skills_per_subject,
    }


@router.get("/next/{session_id}")
def get_next_evaluation_question(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the next question in the adaptive evaluation."""
    session = evaluation_sessions.get(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation session not found or expired",
        )

    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this evaluation session",
        )

    if session["completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evaluation already completed",
        )

    # Find the next skill to test
    current_skill = None
    current_index = session["current_skill_index"]

    while current_index < len(session["evaluation_queue"]):
        skill_info = session["evaluation_queue"][current_index]
        skill_state = session["skill_states"][skill_info["id"]]

        if not skill_state["completed"]:
            current_skill = skill_info
            break
        current_index += 1

    if not current_skill:
        # All skills completed
        session["completed"] = True
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evaluation complete - no more skills to test",
        )

    session["current_skill_index"] = current_index
    skill_id = current_skill["id"]
    skill_state = session["skill_states"][skill_id]
    current_level = skill_state["current_level"]

    # Track subject changes for progress
    if current_skill["subject"] != session["current_subject"]:
        session["last_completed_subject"] = session["current_subject"]
        session["current_subject"] = current_skill["subject"]
        session["subject_skills_completed"] = 0

    # Get template for this skill at current level
    # Try exact level match first, fall back to any available
    template = db.query(QuestionTemplate).filter(
        QuestionTemplate.skill_id == skill_id,
        QuestionTemplate.difficulty == current_level,
    ).first()

    if not template:
        # Fall back to closest available difficulty
        template = db.query(QuestionTemplate).filter(
            QuestionTemplate.skill_id == skill_id,
            QuestionTemplate.difficulty <= current_level,
        ).order_by(QuestionTemplate.difficulty.desc()).first()

    if not template:
        # Last resort: any template
        template = db.query(QuestionTemplate).filter(
            QuestionTemplate.skill_id == skill_id
        ).first()

    if not template:
        # Skip this skill if no template found
        skill_state["completed"] = True
        session["skills_completed"] += 1
        session["subject_skills_completed"] += 1
        return get_next_evaluation_question(session_id, current_user, db)

    # Generate question
    generator = get_generator(template.template_type)
    question_data = generator(current_level)

    question_id = str(uuid.uuid4())

    # Store active question
    session["active_question"] = {
        "question_id": question_id,
        "skill_id": skill_id,
        "skill_name": current_skill["name"],
        "subject": current_skill["subject"],
        "level": current_level,
        "correct_answer": question_data["answer"],
        "steps": question_data.get("steps", []),
    }

    # Calculate progress
    total_skills = session["total_skills"]
    skills_completed = session["skills_completed"]
    current_subject = session["current_subject"]
    subject_total = session["skills_per_subject"].get(current_subject, 1)
    subject_completed = session["subject_skills_completed"]

    # Calculate section index
    subject_order = session.get("subject_order", [])
    section_index = subject_order.index(current_subject) if current_subject in subject_order else 0
    total_sections = len(subject_order)

    return {
        "question_id": question_id,
        "skill_id": skill_id,
        "skill_name": current_skill["name"],
        "subject": current_skill["subject"],
        "question": question_data["question"],
        "difficulty": current_level,
        "template_id": template.id,
        # Progress info
        "progress": {
            "overall_completed": skills_completed,
            "overall_total": total_skills,
            "overall_percent": round((skills_completed / total_skills) * 100) if total_skills > 0 else 0,
            "section_name": current_subject,
            "section_completed": subject_completed,
            "section_total": subject_total,
            "section_percent": round((subject_completed / subject_total) * 100) if subject_total > 0 else 0,
            "section_index": section_index,
            "total_sections": total_sections,
        },
        "section_changed": session["last_completed_subject"] is not None and session["last_completed_subject"] != current_subject,
        "completed_section": session["last_completed_subject"],
    }


@router.post("/answer/{session_id}")
def submit_evaluation_answer(
    session_id: str,
    answer_data: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an answer for the current evaluation question."""
    session = evaluation_sessions.get(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation session not found",
        )

    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    question = session.get("active_question")
    if not question or question["question_id"] != answer_data.question_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found or mismatched",
        )

    skill_id = question["skill_id"]
    skill_state = session["skill_states"][skill_id]
    current_level = skill_state["current_level"]

    # Validate answer
    is_correct = answers_are_equivalent(answer_data.answer, question["correct_answer"])

    # Record attempt
    skill_state["attempts_at_level"] += 1
    skill_state["results"].append({
        "level": current_level,
        "passed": is_correct,
        "attempt": skill_state["attempts_at_level"],
    })

    # Clear section change flag
    session["last_completed_subject"] = None

    # Determine next action based on result
    skill_completed = False
    advanced_level = False

    if is_correct:
        # Passed this level
        skill_state["highest_passed"] = current_level

        if current_level >= MAX_LEVEL:
            # Mastered! Completed all levels
            skill_completed = True
        else:
            # Advance to next level
            skill_state["current_level"] += 1
            skill_state["attempts_at_level"] = 0
            advanced_level = True
    else:
        # Failed
        if skill_state["attempts_at_level"] >= MAX_ATTEMPTS_PER_LEVEL:
            # Failed twice at this level, done with this skill
            skill_completed = True
        # else: will retry same level

    if skill_completed:
        skill_state["completed"] = True
        session["skills_completed"] += 1
        session["subject_skills_completed"] += 1

    # Check if evaluation is complete
    evaluation_complete = session["skills_completed"] >= session["total_skills"]
    if evaluation_complete:
        session["completed"] = True

    # Calculate progress
    total_skills = session["total_skills"]
    skills_completed = session["skills_completed"]
    current_subject = session["current_subject"]
    subject_total = session["skills_per_subject"].get(current_subject, 1)
    subject_completed = session["subject_skills_completed"]

    # Calculate section index
    subject_order = session.get("subject_order", [])
    section_index = subject_order.index(current_subject) if current_subject in subject_order else 0
    total_sections = len(subject_order)

    return {
        "is_correct": is_correct,
        "correct_answer": question["correct_answer"],
        "steps": question.get("steps"),
        "skill_completed": skill_completed,
        "evaluation_complete": evaluation_complete,
        "advanced_level": advanced_level,
        "current_level": skill_state["current_level"],
        "highest_passed": skill_state["highest_passed"],
        "attempts_at_level": skill_state["attempts_at_level"],
        # Progress
        "progress": {
            "overall_completed": skills_completed,
            "overall_total": total_skills,
            "overall_percent": round((skills_completed / total_skills) * 100) if total_skills > 0 else 0,
            "section_name": current_subject,
            "section_completed": subject_completed,
            "section_total": subject_total,
            "section_percent": round((subject_completed / subject_total) * 100) if subject_total > 0 else 0,
            "section_index": section_index,
            "total_sections": total_sections,
        },
    }


@router.get("/report/{session_id}")
def get_evaluation_report(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the evaluation report and save to database."""
    session = evaluation_sessions.get(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation session not found",
        )

    if session["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    if not session["completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evaluation not yet completed",
        )

    # Build skill results
    skill_results = []
    for skill_id, state in session["skill_states"].items():
        if not state["completed"]:
            continue

        proficiency_score = calculate_proficiency_score(state["highest_passed"])
        proficiency_level = get_proficiency_label(state["highest_passed"])

        # Count questions
        questions_total = len(state["results"])
        questions_correct = sum(1 for r in state["results"] if r["passed"])

        skill_results.append({
            "skill_id": skill_id,
            "skill_name": state["name"],
            "subject": state["subject"],
            "highest_level_passed": state["highest_passed"],
            "proficiency_score": round(proficiency_score, 1),
            "proficiency_level": proficiency_level,
            "questions_correct": questions_correct,
            "questions_total": questions_total,
        })

    # Sort by proficiency (lowest first)
    skill_results.sort(key=lambda x: x["proficiency_score"])

    # Categorize
    study = [s for s in skill_results if s["proficiency_level"] == "study"]
    developing = [s for s in skill_results if s["proficiency_level"] == "developing"]
    proficient = [s for s in skill_results if s["proficiency_level"] == "proficient"]
    mastered = [s for s in skill_results if s["proficiency_level"] == "mastered"]

    # Calculate overall score
    total_correct = sum(s["questions_correct"] for s in skill_results)
    total_questions = sum(s["questions_total"] for s in skill_results)

    # Overall proficiency based on average highest level passed
    avg_highest = sum(s["highest_level_passed"] for s in skill_results) / len(skill_results) if skill_results else 0
    overall_score = (avg_highest / MAX_LEVEL) * 100

    completed_at = datetime.utcnow()

    # Save to database if not already saved
    saved_evaluation_id = session.get("saved_evaluation_id")
    if not saved_evaluation_id:
        evaluation = Evaluation(
            user_id=current_user.id,
            started_at=session["started_at"],
            completed_at=completed_at,
            overall_score=round(overall_score, 1),
            total_questions=total_questions,
            total_correct=total_correct,
            skills_mastered=len(mastered),
            skills_review=len(proficient) + len(developing),
            skills_study=len(study),
        )
        db.add(evaluation)
        db.flush()

        for result in skill_results:
            skill_result = EvaluationSkillResult(
                evaluation_id=evaluation.id,
                skill_id=result["skill_id"],
                skill_name=result["skill_name"],
                subject=result["subject"],
                proficiency_score=result["proficiency_score"],
                proficiency_level=result["proficiency_level"],
                questions_correct=result["questions_correct"],
                questions_total=result["questions_total"],
            )
            db.add(skill_result)

        db.commit()
        saved_evaluation_id = evaluation.id
        session["saved_evaluation_id"] = saved_evaluation_id

    # Generate recommendation
    recommendation = _generate_study_recommendation(study, developing, proficient, mastered)

    return {
        "evaluation_id": saved_evaluation_id,
        "session_id": session_id,
        "overall_score": round(overall_score, 1),
        "total_skills_tested": len(skill_results),
        "total_questions": total_questions,
        "total_correct": total_correct,
        "skills_mastered": len(mastered),
        "skills_proficient": len(proficient),
        "skills_developing": len(developing),
        "skills_need_study": len(study),
        "study": study,
        "developing": developing,
        "proficient": proficient,
        "mastered": mastered,
        "all_skills": skill_results,
        "started_at": session["started_at"],
        "completed_at": completed_at,
        "study_recommendation": recommendation,
        # Results by subject
        "by_subject": _group_by_subject(skill_results),
    }


def _group_by_subject(skill_results: list) -> dict:
    """Group skill results by subject."""
    by_subject = {}
    for skill in skill_results:
        subject = skill["subject"]
        if subject not in by_subject:
            by_subject[subject] = {
                "skills": [],
                "mastered": 0,
                "proficient": 0,
                "developing": 0,
                "study": 0,
            }
        by_subject[subject]["skills"].append(skill)
        by_subject[subject][skill["proficiency_level"]] += 1
    return by_subject


def _generate_study_recommendation(study: list, developing: list, proficient: list, mastered: list) -> str:
    """Generate personalized study recommendation."""
    total = len(study) + len(developing) + len(proficient) + len(mastered)

    if not study and not developing:
        if len(mastered) == total:
            return "Outstanding! You've demonstrated mastery across all topics. You're ready for more advanced material!"
        return "Great job! You have a solid foundation. Practice the proficient skills to achieve full mastery."

    if study:
        first_topic = study[0]["skill_name"]
        if len(study) == 1:
            return f"Focus on '{first_topic}' to build your foundation, then work on developing skills."
        return f"Start with '{first_topic}' and the {len(study)} topics that need study. Build a solid foundation before moving forward."

    # Only developing skills need work
    first_topic = developing[0]["skill_name"]
    return f"Good progress! Review '{first_topic}' and {len(developing) - 1} other developing skills to strengthen your understanding."


# ============================================================================
# EVALUATION HISTORY ENDPOINTS
# ============================================================================

@router.get("/history")
def get_evaluation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
):
    """Get the user's evaluation history."""
    evaluations = db.query(Evaluation).filter(
        Evaluation.user_id == current_user.id
    ).order_by(Evaluation.completed_at.desc()).limit(limit).all()

    return {
        "evaluations": [
            {
                "id": e.id,
                "completed_at": e.completed_at,
                "overall_score": e.overall_score,
                "total_questions": e.total_questions,
                "total_correct": e.total_correct,
                "skills_mastered": e.skills_mastered,
                "skills_review": e.skills_review,
                "skills_study": e.skills_study,
            }
            for e in evaluations
        ],
        "total_evaluations": len(evaluations),
    }


@router.get("/history/latest")
def get_latest_evaluation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the user's most recent evaluation with comparison."""
    evaluations = db.query(Evaluation).filter(
        Evaluation.user_id == current_user.id
    ).order_by(Evaluation.completed_at.desc()).limit(2).all()

    if not evaluations:
        return {"latest": None, "previous": None, "improvement": None}

    latest = evaluations[0]
    previous = evaluations[1] if len(evaluations) > 1 else None

    improvement = None
    if previous:
        improvement = {
            "score_change": round(latest.overall_score - previous.overall_score, 1),
            "mastered_change": latest.skills_mastered - previous.skills_mastered,
            "days_between": (latest.completed_at - previous.completed_at).days,
        }

    skill_results = db.query(EvaluationSkillResult).filter(
        EvaluationSkillResult.evaluation_id == latest.id
    ).all()

    study = [s for s in skill_results if s.proficiency_level == "study"]
    developing = [s for s in skill_results if s.proficiency_level == "developing"]
    proficient = [s for s in skill_results if s.proficiency_level == "proficient"]
    mastered = [s for s in skill_results if s.proficiency_level == "mastered"]

    return {
        "latest": {
            "id": latest.id,
            "completed_at": latest.completed_at,
            "overall_score": latest.overall_score,
            "total_questions": latest.total_questions,
            "total_correct": latest.total_correct,
            "skills_mastered": latest.skills_mastered,
            "skills_review": latest.skills_review,
            "skills_study": latest.skills_study,
            "study": [{"skill_id": s.skill_id, "skill_name": s.skill_name, "proficiency_score": s.proficiency_score} for s in study],
            "developing": [{"skill_id": s.skill_id, "skill_name": s.skill_name, "proficiency_score": s.proficiency_score} for s in developing],
            "proficient": [{"skill_id": s.skill_id, "skill_name": s.skill_name, "proficiency_score": s.proficiency_score} for s in proficient],
            "mastered": [{"skill_id": s.skill_id, "skill_name": s.skill_name, "proficiency_score": s.proficiency_score} for s in mastered],
        },
        "previous": {
            "id": previous.id,
            "completed_at": previous.completed_at,
            "overall_score": previous.overall_score,
        } if previous else None,
        "improvement": improvement,
    }


@router.get("/history/{evaluation_id}")
def get_saved_evaluation(
    evaluation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific saved evaluation by ID."""
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == evaluation_id,
        Evaluation.user_id == current_user.id,
    ).first()

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found",
        )

    skill_results = db.query(EvaluationSkillResult).filter(
        EvaluationSkillResult.evaluation_id == evaluation.id
    ).order_by(EvaluationSkillResult.proficiency_score).all()

    study = [s for s in skill_results if s.proficiency_level == "study"]
    developing = [s for s in skill_results if s.proficiency_level == "developing"]
    proficient = [s for s in skill_results if s.proficiency_level == "proficient"]
    mastered = [s for s in skill_results if s.proficiency_level == "mastered"]

    return {
        "evaluation_id": evaluation.id,
        "overall_score": evaluation.overall_score,
        "total_skills_tested": len(skill_results),
        "total_questions": evaluation.total_questions,
        "total_correct": evaluation.total_correct,
        "skills_mastered": evaluation.skills_mastered,
        "skills_review": evaluation.skills_review,
        "skills_need_study": evaluation.skills_study,
        "study": [_skill_to_dict(s) for s in study],
        "developing": [_skill_to_dict(s) for s in developing],
        "proficient": [_skill_to_dict(s) for s in proficient],
        "mastered": [_skill_to_dict(s) for s in mastered],
        "all_skills": [_skill_to_dict(s) for s in skill_results],
        "started_at": evaluation.started_at,
        "completed_at": evaluation.completed_at,
    }


def _skill_to_dict(s: EvaluationSkillResult) -> dict:
    return {
        "skill_id": s.skill_id,
        "skill_name": s.skill_name,
        "subject": s.subject,
        "proficiency_score": s.proficiency_score,
        "proficiency_level": s.proficiency_level,
        "questions_correct": s.questions_correct,
        "questions_total": s.questions_total,
    }
