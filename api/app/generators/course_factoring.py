"""Combined factoring course generator."""

import random
from typing import Any, Dict

from app.generators.factoring_quadratics import generate_factoring_quadratics
from app.generators.factoring_polynomials import generate_factoring_polynomials


def generate_course_factoring(difficulty: int = 1) -> Dict[str, Any]:
    """Generate factoring practice from quadratics through polynomial patterns."""
    if difficulty <= 2:
        return generate_factoring_quadratics(difficulty)
    return random.choice([generate_factoring_quadratics, generate_factoring_polynomials])(3)
