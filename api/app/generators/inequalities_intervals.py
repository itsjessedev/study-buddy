"""Inequalities and interval notation course generator."""

import random
from typing import Any, Dict

from app.generators.inequalities import generate_inequality


def generate_inequalities_intervals(difficulty: int = 1) -> Dict[str, Any]:
    """Generate inequality and interval notation problems."""
    if difficulty in (1, 2):
        return generate_inequality(difficulty)

    lower = random.randint(-6, 1)
    upper = random.randint(2, 9)
    inclusive_lower = random.choice([True, False])
    inclusive_upper = random.choice([True, False])
    left = "[" if inclusive_lower else "("
    right = "]" if inclusive_upper else ")"
    lower_symbol = "\\leq" if inclusive_lower else "<"
    upper_symbol = "\\leq" if inclusive_upper else "<"
    answer = f"{left}{lower},{upper}{right}"
    question = (
        "Write the solution set in interval notation: "
        f"${lower} {lower_symbol} x {upper_symbol} {upper}$."
    )
    steps = [
        "Interval notation records the left endpoint, the right endpoint, and whether endpoints are included.",
        f"The left endpoint is ${lower}$ and the right endpoint is ${upper}$.",
        "Use a square bracket when the endpoint is included and a parenthesis when it is not.",
        f"**Final Answer:** ${answer}$",
    ]
    return {
        "question": question,
        "answer": answer,
        "answer_numeric": None,
        "steps": steps,
        "difficulty": difficulty,
    }
