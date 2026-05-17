"""Piecewise functions and transformation course generator."""

import random
from typing import Any, Dict

from app.generators.piecewise_functions import generate_piecewise_functions


def generate_piecewise_transformations(difficulty: int = 1) -> Dict[str, Any]:
    """Generate piecewise and graph transformation problems."""
    if difficulty in (1, 2):
        return generate_piecewise_functions(difficulty)

    shift = random.randint(1, 5)
    direction = random.choice(["right", "left", "up", "down"])
    if direction == "right":
        transformed = f"f(x-{shift})"
    elif direction == "left":
        transformed = f"f(x+{shift})"
    elif direction == "up":
        transformed = f"f(x)+{shift}"
    else:
        transformed = f"f(x)-{shift}"

    question = f"The graph of $y=f(x)$ is transformed to $y={transformed}$. Which direction does it move?"
    answer = f"{direction} {shift}"
    steps = [
        "Horizontal shifts happen inside the input and move opposite the sign.",
        "Vertical shifts happen outside the function and move with the sign.",
        f"For $y={transformed}$, the graph moves {direction} by ${shift}$ units.",
        f"**Final Answer:** ${answer}$",
    ]
    return {
        "question": question,
        "answer": answer,
        "answer_numeric": None,
        "steps": steps,
        "difficulty": difficulty,
    }
