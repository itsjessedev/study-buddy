"""Domain and range course generator."""

import random
from typing import Any, Dict


def generate_domain_range(difficulty: int = 1) -> Dict[str, Any]:
    """Generate domain and range readiness questions."""
    if difficulty == 1:
        excluded = random.randint(-6, 6)
        sign = "+" if excluded < 0 else "-"
        expression = f"\\frac{{1}}{{x {sign} {abs(excluded)}}}"
        answer = f"x!={excluded}"
        question = f"Find the domain restriction for $f(x) = {expression}$."
        steps = [
            "A rational function is undefined when its denominator is zero.",
            f"Set the denominator equal to zero: $x {sign} {abs(excluded)} = 0$.",
            f"Solve to get $x = {excluded}$.",
            f"The domain is all real numbers except ${excluded}$.",
            f"**Final Answer:** ${answer}$",
        ]
    elif difficulty == 2:
        shift = random.randint(-5, 5)
        sign = "+" if shift >= 0 else "-"
        answer = f"x>={-shift}"
        question = f"Find the domain restriction for $g(x)=\\sqrt{{x {sign} {abs(shift)}}}$."
        steps = [
            "A square root needs a nonnegative radicand.",
            f"Set the inside greater than or equal to zero: $x {sign} {abs(shift)} \\geq 0$.",
            f"Solve the inequality: $x \\geq {-shift}$.",
            f"**Final Answer:** ${answer}$",
        ]
    else:
        vertex_y = random.randint(-4, 4)
        answer = f"y>={vertex_y}"
        question = f"Find the range of $h(x)=(x-2)^2+{vertex_y}$."
        steps = [
            "The square term is always nonnegative.",
            f"The smallest value occurs at the vertex, where $(x-2)^2 = 0$.",
            f"So the minimum output is ${vertex_y}$.",
            f"**Final Answer:** ${answer}$",
        ]

    return {
        "question": question,
        "answer": answer,
        "answer_numeric": None,
        "steps": steps,
        "difficulty": difficulty,
    }
