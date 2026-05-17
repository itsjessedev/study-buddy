"""Trig graph behavior generator for Calc I readiness."""

import random
from typing import Any, Dict


def generate_trig_graphs_calc_ready(difficulty: int = 1) -> Dict[str, Any]:
    """Generate one-property trig graph questions with unambiguous answers."""
    func = random.choice(["sin", "cos"])

    if difficulty == 1:
        amplitude = random.choice([2, 3, 4, 5])
        question = f"What is the amplitude of $y={amplitude}\\{func}(x)$?"
        steps = [
            f"The amplitude is the absolute value of the coefficient multiplying $\\{func}(x)$.",
            f"$|{amplitude}|={amplitude}$",
            f"**Final Answer:** ${amplitude}$",
        ]
        answer = str(amplitude)

    elif difficulty == 2:
        b = random.choice([2, 3, 4])
        if b == 2:
            period = "\\pi"
        else:
            period = f"2pi/{b}"
        question = f"What is the period of $y=\\{func}({b}x)$?"
        steps = [
            "The period of sine or cosine is $\\frac{2\\pi}{|B|}$.",
            f"Here, $B={b}$.",
            f"Period $=\\frac{{2\\pi}}{{{b}}}$.",
            f"**Final Answer:** ${period}$",
        ]
        answer = period

    else:
        shift = random.choice([-3, -2, 2, 3])
        sign = "+" if shift > 0 else "-"
        question = f"What is the midline of $y=\\{func}(x){sign}{abs(shift)}$?"
        steps = [
            "The midline is the vertical shift.",
            f"The function is shifted by ${shift}$.",
            f"**Final Answer:** $y={shift}$",
        ]
        answer = f"y={shift}"

    return {
        "question": question,
        "answer": answer,
        "answer_numeric": None,
        "steps": steps,
        "difficulty": difficulty,
    }
