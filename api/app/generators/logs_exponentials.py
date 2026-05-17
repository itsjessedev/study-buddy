"""Logs and exponentials question generator."""

import random
from typing import Any, Dict


def generate_logs_exponentials(difficulty: int = 1) -> Dict[str, Any]:
    """Generate logarithm and exponential problems with numeric answers."""
    if difficulty == 1:
        base = random.choice([2, 3, 4, 5, 10])
        exponent = random.randint(1, 4)
        value = base ** exponent
        question = f"Evaluate $\\log_{{{base}}}({value})$."
        steps = [
            f"$\\log_{{{base}}}({value})$ asks: ${base}$ to what power equals ${value}$?",
            f"${base}^{exponent} = {value}$.",
            f"**Final Answer:** ${exponent}$",
        ]
        answer = exponent

    elif difficulty == 2:
        base = random.choice([2, 3, 4, 5])
        exponent = random.randint(2, 5)
        value = base ** exponent
        question = f"Solve for $x$: ${base}^x = {value}$."
        steps = [
            "Rewrite the exponential equation using a logarithm.",
            f"$x = \\log_{{{base}}}({value})$.",
            f"Since ${base}^{exponent} = {value}$, $x = {exponent}$.",
            f"**Final Answer:** ${exponent}$",
        ]
        answer = exponent

    else:
        start = random.choice([50, 100, 200, 500])
        rate = random.choice([2, 3, 4])
        periods = random.randint(2, 5)
        total = start * (rate ** periods)
        question = f"A quantity starts at ${start}$ and is multiplied by ${rate}$ each period. What is it after ${periods}$ periods?"
        steps = [
            "Use the exponential growth model $A = a \\cdot b^t$.",
            f"Here $a = {start}$, $b = {rate}$, and $t = {periods}$.",
            f"$A = {start} \\cdot {rate}^{periods}$.",
            f"$A = {total}$.",
            f"**Final Answer:** ${total}$",
        ]
        answer = total

    return {
        "question": question,
        "answer": str(answer),
        "answer_numeric": answer,
        "steps": steps,
        "difficulty": difficulty,
    }
