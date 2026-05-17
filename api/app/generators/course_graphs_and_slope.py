"""Combined graphs and slope course generator."""

import random
from typing import Any, Dict

from app.generators.graphing_linear_equations import generate_graphing_linear_equations
from app.generators.slope_intercept import generate_slope_intercept


def generate_course_graphs_and_slope(difficulty: int = 1) -> Dict[str, Any]:
    """Generate linear graphing and slope practice."""
    if difficulty == 1:
        return generate_slope_intercept(1)
    return random.choice([generate_slope_intercept, generate_graphing_linear_equations])(difficulty)
