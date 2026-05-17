"""Combined fractions course generator."""

import random
from typing import Any, Dict

from app.generators.fraction_operations import generate_fraction_addition
from app.generators.fractions_multiplication import generate_fractions_multiplication
from app.generators.fractions_division import generate_fractions_division


def generate_course_fractions(difficulty: int = 1) -> Dict[str, Any]:
    """Generate varied fraction practice across operations."""
    if difficulty == 1:
        return generate_fraction_addition(1)
    if difficulty == 2:
        generator = random.choice([generate_fraction_addition, generate_fractions_multiplication])
        return generator(2)
    generator = random.choice([
        generate_fraction_addition,
        generate_fractions_multiplication,
        generate_fractions_division,
    ])
    return generator(3)
