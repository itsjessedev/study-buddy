"""Progress tracking and analytics endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import User, Skill, UserMastery, QuestionHistory, SkillPrerequisite
from app.schemas import MasteryResponse, ProgressSummary, WeakArea
from app.auth import get_current_user
from app.course_catalog import get_current_course_slugs

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/weak-areas", response_model=List[WeakArea])
def get_weak_areas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Identify weak areas that need attention.

    Returns skills with low mastery, prioritizing those that are prerequisites
    for other skills.
    """
    # Get weak skills (mastery < 60)
    weak_mastery = (
        db.query(UserMastery, Skill)
        .join(Skill, UserMastery.skill_id == Skill.id)
        .filter(
            UserMastery.user_id == current_user.id,
            UserMastery.mastery_score < 60,
            Skill.slug.in_(get_current_course_slugs()),
        )
        .all()
    )

    weak_areas = []

    for mastery, skill in weak_mastery:
        # Check if this skill is a prerequisite for others
        dependent_skills = (
            db.query(Skill.name)
            .join(
                SkillPrerequisite,
                Skill.id == SkillPrerequisite.skill_id,
            )
            .filter(
                SkillPrerequisite.prerequisite_id == skill.id,
                Skill.slug.in_(get_current_course_slugs()),
            )
            .all()
        )

        dependent_skill_names = [name for (name,) in dependent_skills]
        is_prerequisite = len(dependent_skill_names) > 0

        weak_areas.append(
            WeakArea(
                skill_id=skill.id,
                skill_name=skill.name,
                subject=skill.subject,
                mastery_score=mastery.mastery_score,
                is_prerequisite_gap=is_prerequisite,
                dependent_skills=dependent_skill_names,
            )
        )

    # Sort by is_prerequisite (True first) then by mastery score (lowest first)
    weak_areas.sort(key=lambda x: (not x.is_prerequisite_gap, x.mastery_score))

    return weak_areas


@router.get("/next-review", response_model=List[MasteryResponse])
def get_next_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get skills that are due for spaced repetition review."""
    from datetime import datetime

    due_mastery = (
        db.query(UserMastery, Skill)
        .join(Skill, UserMastery.skill_id == Skill.id)
        .filter(
            UserMastery.user_id == current_user.id,
            UserMastery.next_review <= datetime.utcnow(),
            Skill.slug.in_(get_current_course_slugs()),
        )
        .all()
    )

    reviews = []
    for mastery, skill in due_mastery:
        accuracy = (
            (mastery.correct_attempts / mastery.total_attempts * 100)
            if mastery.total_attempts > 0
            else 0.0
        )

        reviews.append(
            MasteryResponse(
                skill_id=skill.id,
                skill_name=skill.name,
                subject=skill.subject,
                mastery_score=mastery.mastery_score,
                total_attempts=mastery.total_attempts,
                correct_attempts=mastery.correct_attempts,
                accuracy=accuracy,
                last_practiced=mastery.last_practiced,
                next_review=mastery.next_review,
            )
        )

    return reviews


@router.get("", response_model=ProgressSummary)
def get_progress_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get overall progress summary for the user."""
    # Get all mastery records
    mastery_records = (
        db.query(UserMastery, Skill)
        .join(Skill, UserMastery.skill_id == Skill.id)
        .filter(
            UserMastery.user_id == current_user.id,
            Skill.slug.in_(get_current_course_slugs()),
        )
        .all()
    )

    # Calculate stats
    total_questions = (
        db.query(func.count(QuestionHistory.id))
        .join(Skill, QuestionHistory.skill_id == Skill.id)
        .filter(QuestionHistory.user_id == current_user.id)
        .filter(Skill.slug.in_(get_current_course_slugs()))
        .scalar()
        or 0
    )

    correct_questions = (
        db.query(func.count(QuestionHistory.id))
        .join(Skill, QuestionHistory.skill_id == Skill.id)
        .filter(
            QuestionHistory.user_id == current_user.id,
            QuestionHistory.is_correct == True,
            Skill.slug.in_(get_current_course_slugs()),
        )
        .scalar()
        or 0
    )

    overall_accuracy = (
        (correct_questions / total_questions * 100) if total_questions > 0 else 0.0
    )

    skills_practiced = len(mastery_records)
    skills_mastered = sum(1 for m, _ in mastery_records if m.mastery_score >= 90)
    skills_in_progress = sum(
        1 for m, _ in mastery_records if 50 <= m.mastery_score < 90
    )
    skills_weak = sum(1 for m, _ in mastery_records if m.mastery_score < 50)

    # Build mastery list
    mastery_list = []
    for mastery, skill in mastery_records:
        accuracy = (
            (mastery.correct_attempts / mastery.total_attempts * 100)
            if mastery.total_attempts > 0
            else 0.0
        )

        mastery_list.append(
            MasteryResponse(
                skill_id=skill.id,
                skill_name=skill.name,
                subject=skill.subject,
                mastery_score=mastery.mastery_score,
                total_attempts=mastery.total_attempts,
                correct_attempts=mastery.correct_attempts,
                accuracy=accuracy,
                last_practiced=mastery.last_practiced,
                next_review=mastery.next_review,
            )
        )

    return {
        "total_questions_answered": total_questions,
        "overall_accuracy": overall_accuracy,
        "skills_practiced": skills_practiced,
        "skills_mastered": skills_mastered,
        "skills_in_progress": skills_in_progress,
        "skills_weak": skills_weak,
        "mastery_by_skill": mastery_list,
    }


@router.get("/{skill_id}", response_model=MasteryResponse)
def get_skill_progress(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get progress for a specific skill."""
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

    mastery = (
        db.query(UserMastery)
        .filter(
            UserMastery.user_id == current_user.id,
            UserMastery.skill_id == skill_id,
        )
        .first()
    )

    if not mastery:
        # No practice yet
        return MasteryResponse(
            skill_id=skill.id,
            skill_name=skill.name,
            subject=skill.subject,
            mastery_score=0.0,
            total_attempts=0,
            correct_attempts=0,
            accuracy=0.0,
            last_practiced=None,
            next_review=None,
        )

    accuracy = (
        (mastery.correct_attempts / mastery.total_attempts * 100)
        if mastery.total_attempts > 0
        else 0.0
    )

    return MasteryResponse(
        skill_id=skill.id,
        skill_name=skill.name,
        subject=skill.subject,
        mastery_score=mastery.mastery_score,
        total_attempts=mastery.total_attempts,
        correct_attempts=mastery.correct_attempts,
        accuracy=accuracy,
        last_practiced=mastery.last_practiced,
        next_review=mastery.next_review,
    )
