"""Adaptive difficulty and question selection algorithms."""

from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Skill, UserMastery, QuestionTemplate, SkillPrerequisite
from app.learning.mastery import get_recent_results
from app.learning.spaced_repetition import is_due_for_review
from app.course_catalog import get_current_course_slugs
import random


def get_adaptive_difficulty(user_id: int, skill_id: int, db: Session) -> int:
    """
    Adjust difficulty based on recent performance.

    Difficulty Levels (standardized to 3):
    - Level 1: Foundations
    - Level 2: Proficient
    - Level 3: Mastery

    Rules:
    - 3+ correct in a row at current level → increase difficulty
    - 2+ incorrect in a row → decrease difficulty
    - Otherwise maintain current level

    Args:
        user_id: User ID
        skill_id: Skill ID
        db: Database session

    Returns:
        Difficulty level (1-3)
    """
    MAX_DIFFICULTY = 3

    recent_results = get_recent_results(user_id, skill_id, db, limit=3)

    # Get current difficulty (from last attempt or base difficulty)
    mastery = (
        db.query(UserMastery)
        .filter(
            UserMastery.user_id == user_id,
            UserMastery.skill_id == skill_id,
        )
        .first()
    )

    # Default starting difficulty
    current_diff = 1

    if mastery and recent_results:
        # Estimate current difficulty from mastery score
        # Using 3-level system: 67%+ mastery = level 3, 33%+ = level 2, else = level 1
        if mastery.mastery_score >= 67:
            current_diff = 3
        elif mastery.mastery_score >= 33:
            current_diff = 2
        else:
            current_diff = 1

        # Adjust based on recent performance
        if len(recent_results) >= 3 and all(recent_results[:3]):
            # All correct - increase difficulty
            current_diff = min(current_diff + 1, MAX_DIFFICULTY)
        elif len(recent_results) >= 2 and not any(recent_results[:2]):
            # Last 2 incorrect - decrease difficulty
            current_diff = max(current_diff - 1, 1)

    return current_diff


def get_due_reviews(user_id: int, db: Session) -> List[int]:
    """Get list of skill IDs that are due for spaced repetition review."""
    # Get skills with available templates
    skills_with_templates = (
        db.query(QuestionTemplate.skill_id)
        .join(Skill, Skill.id == QuestionTemplate.skill_id)
        .filter(Skill.slug.in_(get_current_course_slugs()))
        .distinct()
        .all()
    )
    template_skill_ids = [skill_id for (skill_id,) in skills_with_templates]

    if not template_skill_ids:
        return []

    due_skills = (
        db.query(UserMastery.skill_id)
        .filter(
            UserMastery.user_id == user_id,
            UserMastery.skill_id.in_(template_skill_ids),
            UserMastery.next_review <= datetime.utcnow(),
        )
        .all()
    )

    return [skill_id for (skill_id,) in due_skills]


def get_weak_prerequisites(user_id: int, db: Session, threshold: float = 50.0) -> List[int]:
    """
    Identify prerequisite skills that need work.

    Checks for skills with low mastery that are prerequisites for other skills.

    Args:
        user_id: User ID
        db: Database session
        threshold: Mastery score below which a skill is considered weak

    Returns:
        List of skill IDs that are weak prerequisites
    """
    # Get skills with available templates
    skills_with_templates = (
        db.query(QuestionTemplate.skill_id)
        .join(Skill, Skill.id == QuestionTemplate.skill_id)
        .filter(Skill.slug.in_(get_current_course_slugs()))
        .distinct()
        .all()
    )
    template_skill_ids = [skill_id for (skill_id,) in skills_with_templates]

    if not template_skill_ids:
        return []

    # Get all weak skills (mastery < threshold)
    weak_skills = (
        db.query(UserMastery.skill_id)
        .filter(
            UserMastery.user_id == user_id,
            UserMastery.skill_id.in_(template_skill_ids),
            UserMastery.mastery_score < threshold,
        )
        .all()
    )

    weak_skill_ids = [skill_id for (skill_id,) in weak_skills]

    # Filter to only those that are prerequisites for other skills
    prerequisites = (
        db.query(SkillPrerequisite.prerequisite_id)
        .filter(SkillPrerequisite.prerequisite_id.in_(weak_skill_ids))
        .distinct()
        .all()
    )

    return [prereq_id for (prereq_id,) in prerequisites]


def get_unpracticed_skills(user_id: int, db: Session) -> List[int]:
    """Get skills that have never been practiced (and have question templates)."""
    # Get skills with available templates
    skills_with_templates = (
        db.query(QuestionTemplate.skill_id)
        .join(Skill, Skill.id == QuestionTemplate.skill_id)
        .filter(Skill.slug.in_(get_current_course_slugs()))
        .distinct()
        .all()
    )
    template_skill_ids = [skill_id for (skill_id,) in skills_with_templates]

    if not template_skill_ids:
        return []

    # Get practiced skill IDs
    practiced = (
        db.query(UserMastery.skill_id)
        .filter(UserMastery.user_id == user_id)
        .all()
    )
    practiced_ids = [skill_id for (skill_id,) in practiced]

    # Return unpracticed skills that have templates
    return [sid for sid in template_skill_ids if sid not in practiced_ids]


def weighted_random_skill(user_id: int, db: Session) -> Optional[int]:
    """
    Select a random skill weighted by low mastery scores.

    Skills with lower mastery are more likely to be selected.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        Skill ID or None if no skills available
    """
    # Get skills with available templates
    skills_with_templates = (
        db.query(QuestionTemplate.skill_id)
        .join(Skill, Skill.id == QuestionTemplate.skill_id)
        .filter(Skill.slug.in_(get_current_course_slugs()))
        .distinct()
        .all()
    )
    template_skill_ids = [skill_id for (skill_id,) in skills_with_templates]

    if not template_skill_ids:
        return None

    mastery_records = (
        db.query(UserMastery)
        .filter(
            UserMastery.user_id == user_id,
            UserMastery.skill_id.in_(template_skill_ids)
        )
        .all()
    )

    if not mastery_records:
        return None

    # Weight by inverse of mastery (lower mastery = higher weight)
    weights = [max(100 - m.mastery_score, 10) for m in mastery_records]
    skill_ids = [m.skill_id for m in mastery_records]

    # Weighted random selection
    selected = random.choices(skill_ids, weights=weights, k=1)[0]
    return selected


def select_next_skill(user_id: int, db: Session) -> Optional[int]:
    """
    Select the next skill to practice using adaptive algorithm.

    Priority:
    1. Skills due for review (spaced repetition)
    2. Weak prerequisites (if failing advanced topics)
    3. New skills (never practiced)
    4. Random skill weighted by low mastery

    Args:
        user_id: User ID
        db: Database session

    Returns:
        Skill ID or None if no skills available
    """
    # 1. Check for due reviews
    due_skills = get_due_reviews(user_id, db)
    if due_skills:
        return random.choice(due_skills)

    # 2. Check for weak prerequisites
    weak_prereqs = get_weak_prerequisites(user_id, db)
    if weak_prereqs:
        return random.choice(weak_prereqs)

    # 3. Check for new skills
    unpracticed = get_unpracticed_skills(user_id, db)
    if unpracticed:
        return random.choice(unpracticed)

    # 4. Weighted random selection
    return weighted_random_skill(user_id, db)
