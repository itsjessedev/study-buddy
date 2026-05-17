"""Polynomial and rational graph behavior generator for Calc I readiness."""

import random
from typing import Any, Dict


def generate_polynomial_rational_graphs(difficulty: int = 1) -> Dict[str, Any]:
    """Generate focused graph-behavior questions."""
    if difficulty == 1:
        a = random.randint(-5, -1)
        b = random.randint(1, 6)
        question = f"Find the x-intercepts of $f(x)=(x {-a:+d})(x {-b:+d})$."
        steps = [
            "Set the function equal to zero.",
            f"$(x {-a:+d})(x {-b:+d})=0$",
            "Use the zero product property: each factor can be zero.",
            f"$x {-a:+d}=0 \\Rightarrow x={a}$",
            f"$x {-b:+d}=0 \\Rightarrow x={b}$",
            f"**Final Answer:** ${a}, {b}$",
        ]
        answer = f"{a},{b}"

    elif difficulty == 2:
        degree = random.choice([3, 4, 5])
        coefficient = random.choice([-2, -1, 1, 2])
        if degree % 2 == 0:
            behavior = "both up" if coefficient > 0 else "both down"
            left = "up" if coefficient > 0 else "down"
            right = left
        else:
            left = "down" if coefficient > 0 else "up"
            right = "up" if coefficient > 0 else "down"
            behavior = f"left {left}, right {right}"

        coefficient_text = "" if coefficient == 1 else "-" if coefficient == -1 else str(coefficient)
        question = f"Describe the end behavior of $f(x)={coefficient_text}x^{degree}+\\text{{ lower terms }}$."
        steps = [
            "End behavior comes from the leading term.",
            f"The leading degree is ${degree}$ and the leading coefficient is ${coefficient}$.",
            "Even degree means both ends go the same direction. Odd degree means the ends go opposite directions.",
            f"**Final Answer:** {behavior}",
        ]
        answer = behavior

    else:
        a = random.choice([-4, -3, -2, 2, 3, 4])
        numerator_slope = random.choice([1, 2, 3])
        denominator_slope = random.choice([1, 2])
        horizontal = numerator_slope / denominator_slope
        horizontal_answer = (
            str(int(horizontal))
            if horizontal == int(horizontal)
            else f"{numerator_slope}/{denominator_slope}"
        )
        question = (
            f"Find the vertical asymptote and horizontal asymptote of "
            f"$f(x)=\\frac{{{numerator_slope}x+1}}{{{denominator_slope}(x {-a:+d})}}$."
        )
        steps = [
            "The vertical asymptote comes from the denominator zero.",
            f"${denominator_slope}(x {-a:+d})=0 \\Rightarrow x={a}$",
            "The horizontal asymptote comes from the ratio of leading coefficients because both degrees are 1.",
            f"$y=\\frac{{{numerator_slope}}}{{{denominator_slope}}}$",
            f"**Final Answer:** $x={a}, y={horizontal_answer}$",
        ]
        answer = f"x={a},y={horizontal_answer}"

    return {
        "question": question,
        "answer": answer,
        "answer_numeric": None,
        "steps": steps,
        "difficulty": difficulty,
    }
