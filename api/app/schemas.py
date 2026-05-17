"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any


# Auth schemas
class UserCreate(BaseModel):
    """Schema for user registration."""

    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Schema for user login."""

    username: str
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Schema for token refresh request."""

    refresh_token: str


class UserResponse(BaseModel):
    """Schema for user information response."""

    id: int
    username: str
    first_name: str
    created_at: datetime
    is_admin: bool = False

    class Config:
        from_attributes = True


# Skill schemas
class SkillBase(BaseModel):
    """Base skill schema."""

    slug: str
    name: str
    subject: str
    description: Optional[str] = None
    khan_url: Optional[str] = None
    difficulty_base: int = 1


class SkillResponse(SkillBase):
    """Schema for skill response."""

    id: int
    explanation: Optional[str] = None

    class Config:
        from_attributes = True


class SkillListResponse(BaseModel):
    """Schema for list of skills."""

    skills: List[SkillResponse]
    total: int


# Question schemas
class QuestionResponse(BaseModel):
    """Schema for generated question."""

    question_id: str
    skill_id: int
    skill_name: str
    question: str
    difficulty: int
    template_id: int


class AnswerSubmit(BaseModel):
    """Schema for answer submission."""

    question_id: str
    answer: str
    time_taken_seconds: Optional[int] = None


class AnswerValidationRequest(BaseModel):
    """Schema for checking an answer against an expected value."""

    answer: str
    expected_answer: str


class AnswerValidationResponse(BaseModel):
    """Schema for answer equivalence validation."""

    is_correct: bool


class AnswerFeedback(BaseModel):
    """Schema for answer feedback."""

    is_correct: bool
    user_answer: str
    correct_answer: str
    explanation: Optional[str] = None
    steps: Optional[List[str]] = None
    next_question: Optional[QuestionResponse] = None


# Progress schemas
class MasteryResponse(BaseModel):
    """Schema for skill mastery."""

    skill_id: int
    skill_name: str
    subject: str
    mastery_score: float
    total_attempts: int
    correct_attempts: int
    accuracy: float
    last_practiced: Optional[datetime] = None
    next_review: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProgressSummary(BaseModel):
    """Schema for overall progress summary."""

    total_questions_answered: int
    overall_accuracy: float
    skills_practiced: int
    skills_mastered: int  # mastery >= 90
    skills_in_progress: int  # 50 <= mastery < 90
    skills_weak: int  # mastery < 50
    mastery_by_skill: List[MasteryResponse]


class WeakArea(BaseModel):
    """Schema for weak area identification."""

    skill_id: int
    skill_name: str
    subject: str
    mastery_score: float
    is_prerequisite_gap: bool
    dependent_skills: List[str]  # Skills that depend on this one


# Content schemas
class ExplainerResponse(BaseModel):
    """Schema for skill explainer."""

    skill_id: int
    skill_name: str
    subject: str
    explanation: str
    khan_url: Optional[str] = None
