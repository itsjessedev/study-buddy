"""Skills and content endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from app.database import get_db
from app.models import Skill
from app.schemas import SkillResponse, SkillListResponse, ExplainerResponse
from app.auth import get_current_user
from app.course_catalog import get_current_course_order, get_current_course_slugs

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=SkillListResponse)
def list_skills(
    subject: str = None,
    db: Session = Depends(get_db),
):
    """
    List all available skills, optionally filtered by subject.

    Query params:
    - subject: Filter by subject (e.g., "Algebra I", "Pre-Algebra")
    """
    query = db.query(Skill).filter(Skill.slug.in_(get_current_course_slugs()))

    if subject:
        query = query.filter(Skill.subject == subject)

    course_order = get_current_course_order()
    order_index = {slug: index for index, slug in enumerate(course_order)}
    skills = sorted(query.all(), key=lambda skill: order_index.get(skill.slug, len(order_index)))

    return {"skills": skills, "total": len(skills)}


@router.get("/subjects", response_model=Dict[str, List[SkillResponse]])
def get_skills_by_subject(db: Session = Depends(get_db)):
    """Get all skills grouped by subject."""
    course_order = get_current_course_order()
    order_index = {slug: index for index, slug in enumerate(course_order)}
    skills = sorted(
        db.query(Skill)
        .filter(Skill.slug.in_(get_current_course_slugs()))
        .all(),
        key=lambda skill: order_index.get(skill.slug, len(order_index)),
    )

    grouped = {}
    for skill in skills:
        if skill.subject not in grouped:
            grouped[skill.subject] = []

        grouped[skill.subject].append(
            SkillResponse(
                id=skill.id,
                slug=skill.slug,
                name=skill.name,
                subject=skill.subject,
                description=skill.description,
                khan_url=skill.khan_url,
                difficulty_base=skill.difficulty_base,
                explanation=None,  # Don't include full explanation in list
            )
        )

    return grouped


@router.get("/{skill_id}", response_model=ExplainerResponse)
def get_skill_explainer(
    skill_id: int,
    db: Session = Depends(get_db),
):
    """Get detailed explanation and resources for a skill."""
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

    return {
        "skill_id": skill.id,
        "skill_name": skill.name,
        "subject": skill.subject,
        "explanation": skill.explanation or "Explanation coming soon.",
        "khan_url": skill.khan_url,
    }
