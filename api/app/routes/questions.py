"""Questions and quiz endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import json

from app.database import get_db
from app.models import User, Skill, QuestionTemplate, UserMastery, QuestionHistory
from app.schemas import (
    QuestionResponse,
    AnswerSubmit,
    AnswerFeedback,
    AnswerValidationRequest,
    AnswerValidationResponse,
)
from app.auth import get_current_user
from app.learning.adaptive import select_next_skill, get_adaptive_difficulty
from app.learning.mastery import calculate_mastery
from app.learning.spaced_repetition import calculate_next_review
from app.generators import get_generator
from app.utils.answer_validation import answers_are_equivalent
from app.course_catalog import get_current_course_slugs

router = APIRouter(prefix="/questions", tags=["Questions"])

# In-memory cache for active questions (in production, use Redis)
active_questions = {}


@router.post("/validate", response_model=AnswerValidationResponse)
def validate_answer(
    answer_data: AnswerValidationRequest,
    current_user: User = Depends(get_current_user),
):
    """Check whether two answer formats are mathematically equivalent."""
    expected_alternatives = answer_data.expected_answer.split("|")
    return {
        "is_correct": any(
            answers_are_equivalent(answer_data.answer, expected_answer)
            for expected_answer in expected_alternatives
        )
    }


@router.get("/next", response_model=QuestionResponse)
def get_next_question(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the next adaptive question for the user.

    Uses adaptive algorithm to select skill based on:
    - Spaced repetition (due reviews)
    - Weak prerequisites
    - Unpracticed skills
    - Weighted random (favor low mastery)
    """
    # Select next skill adaptively
    skill_id = select_next_skill(current_user.id, db)

    if skill_id is None:
        # No skills available - return first skill as fallback
        first_skill = db.query(Skill).filter(Skill.slug.in_(get_current_course_slugs())).first()
        if not first_skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No skills available. Please seed the database.",
            )
        skill_id = first_skill.id

    # Get the skill
    skill = (
        db.query(Skill)
        .filter(Skill.id == skill_id, Skill.slug.in_(get_current_course_slugs()))
        .first()
    )
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill {skill_id} not found",
        )

    # Get adaptive difficulty
    difficulty = get_adaptive_difficulty(current_user.id, skill_id, db)

    # Get a template for this skill
    template = (
        db.query(QuestionTemplate)
        .filter(
            QuestionTemplate.skill_id == skill_id,
            QuestionTemplate.difficulty == difficulty,
        )
        .first()
    )

    # Fallback to any template for this skill if exact difficulty not found
    if not template:
        template = (
            db.query(QuestionTemplate)
            .filter(QuestionTemplate.skill_id == skill_id)
            .first()
        )

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No question templates found for skill {skill_id}",
        )

    # Generate question
    generator = get_generator(template.template_type)
    question_data = generator(difficulty)

    # Create unique question ID
    question_id = str(uuid.uuid4())

    # Cache the question data (for answer validation)
    active_questions[question_id] = {
        "skill_id": skill_id,
        "template_id": template.id,
        "difficulty": difficulty,
        "correct_answer": question_data["answer"],
        "answer_numeric": question_data.get("answer_numeric"),
        "steps": question_data.get("steps", []),
        "created_at": datetime.utcnow(),
    }

    return {
        "question_id": question_id,
        "skill_id": skill_id,
        "skill_name": skill.name,
        "question": question_data["question"],
        "difficulty": difficulty,
        "template_id": template.id,
    }


@router.post("/answer", response_model=AnswerFeedback)
def submit_answer(
    answer_data: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an answer and get feedback."""
    # Get cached question
    question = active_questions.get(answer_data.question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found or expired",
        )

    # Validate answer (handles fractions, decimals, mixed numbers, etc.)
    is_correct = answers_are_equivalent(answer_data.answer, question["correct_answer"])

    # Record attempt in history
    attempt = QuestionHistory(
        user_id=current_user.id,
        skill_id=question["skill_id"],
        template_id=question["template_id"],
        is_correct=is_correct,
        time_taken_seconds=answer_data.time_taken_seconds,
        difficulty=question["difficulty"],
    )
    db.add(attempt)

    # Update or create mastery record
    mastery = (
        db.query(UserMastery)
        .filter(
            UserMastery.user_id == current_user.id,
            UserMastery.skill_id == question["skill_id"],
        )
        .first()
    )

    if not mastery:
        mastery = UserMastery(
            user_id=current_user.id,
            skill_id=question["skill_id"],
            mastery_score=0.0,
            total_attempts=0,
            correct_attempts=0,
        )
        db.add(mastery)

    # Update counts
    mastery.total_attempts += 1
    if is_correct:
        mastery.correct_attempts += 1

    mastery.last_practiced = datetime.utcnow()

    # Recalculate mastery score
    db.commit()  # Commit to make the new attempt available
    new_mastery_score = calculate_mastery(current_user.id, question["skill_id"], db)
    mastery.mastery_score = new_mastery_score

    # Calculate next review time
    mastery.next_review = calculate_next_review(new_mastery_score, mastery.last_practiced)

    db.commit()

    # Get skill info for explanation
    skill = db.query(Skill).filter(Skill.id == question["skill_id"]).first()

    # Remove question from cache
    del active_questions[answer_data.question_id]

    # Get next question
    try:
        next_q = get_next_question(current_user, db)
    except HTTPException:
        next_q = None

    return {
        "is_correct": is_correct,
        "user_answer": answer_data.answer,
        "correct_answer": question["correct_answer"],
        "explanation": skill.explanation if skill else None,
        "steps": question.get("steps"),
        "next_question": next_q,
    }


@router.get("/practice/{skill_id}", response_model=QuestionResponse)
def practice_specific_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a question for a specific skill (for targeted practice)."""
    skill = (
        db.query(Skill)
        .filter(Skill.id == skill_id, Skill.slug.in_(get_current_course_slugs()))
        .first()
    )
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill {skill_id} not found",
        )

    # Get adaptive difficulty for this skill
    difficulty = get_adaptive_difficulty(current_user.id, skill_id, db)

    # Get a template
    template = (
        db.query(QuestionTemplate)
        .filter(
            QuestionTemplate.skill_id == skill_id,
            QuestionTemplate.difficulty == difficulty,
        )
        .first()
    )

    if not template:
        template = (
            db.query(QuestionTemplate)
            .filter(QuestionTemplate.skill_id == skill_id)
            .first()
        )

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No templates found for skill {skill_id}",
        )

    # Generate question
    generator = get_generator(template.template_type)
    question_data = generator(difficulty)

    question_id = str(uuid.uuid4())

    active_questions[question_id] = {
        "skill_id": skill_id,
        "template_id": template.id,
        "difficulty": difficulty,
        "correct_answer": question_data["answer"],
        "answer_numeric": question_data.get("answer_numeric"),
        "steps": question_data.get("steps", []),
        "created_at": datetime.utcnow(),
    }

    return {
        "question_id": question_id,
        "skill_id": skill_id,
        "skill_name": skill.name,
        "question": question_data["question"],
        "difficulty": difficulty,
        "template_id": template.id,
    }
