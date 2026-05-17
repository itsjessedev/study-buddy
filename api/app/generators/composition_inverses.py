"""Composition and inverses course generator."""

import random
from typing import Any, Dict

from app.generators.function_composition import generate_function_composition
from app.generators.inverse_functions import generate_inverse_functions


def generate_composition_inverses(difficulty: int = 1) -> Dict[str, Any]:
    """Generate function composition and inverse function problems."""
    if difficulty == 1:
        return generate_function_composition(1)
    if difficulty == 2:
        return random.choice([generate_function_composition, generate_inverse_functions])(2)
    return generate_inverse_functions(3)
