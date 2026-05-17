"""Core trigonometric identities course generator."""

from typing import Any, Dict

from app.generators.pythagorean_identities import generate_pythagorean_identities


def generate_trig_identities(difficulty: int = 1) -> Dict[str, Any]:
    """Generate trig identity practice for Calc I readiness."""
    return generate_pythagorean_identities(difficulty)
