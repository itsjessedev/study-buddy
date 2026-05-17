"""Combined solving equations course generator."""

import random
from typing import Any, Dict

from app.generators.linear_equation import generate_linear_equation
from app.generators.equations_variables_both_sides import generate_equations_variables_both_sides


def generate_course_solving_equations(difficulty: int = 1) -> Dict[str, Any]:
    """Generate one-variable equation practice."""
    if difficulty == 1:
        return generate_linear_equation(1)
    if difficulty == 2:
        return random.choice([generate_linear_equation, generate_equations_variables_both_sides])(2)
    return generate_equations_variables_both_sides(3)
