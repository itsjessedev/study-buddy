"""Function notation question generator."""

import random
from typing import Any, Dict


def _format_linear(a: int, b: int) -> str:
    if a == 1:
        first = "x"
    elif a == -1:
        first = "-x"
    else:
        first = f"{a}x"

    if b == 0:
        return first
    sign = "+" if b > 0 else "-"
    return f"{first} {sign} {abs(b)}"


def generate_function_notation(difficulty: int = 1) -> Dict[str, Any]:
    """Generate function notation problems with numeric answers."""
    if difficulty == 1:
        a = random.choice([2, 3, 4, -2, -3])
        b = random.randint(-6, 6)
        x = random.randint(-5, 7)
        expression = _format_linear(a, b)
        answer = a * x + b
        steps = [
            f"Given $f(x) = {expression}$, evaluate $f({x})$.",
            f"Replace every $x$ with ${x}$.",
            f"$f({x}) = {a}({x}) + ({b})$",
            f"$f({x}) = {answer}$",
            f"**Final Answer:** ${answer}$",
        ]
        question = f"If $f(x) = {expression}$, find $f({x})$."

    elif difficulty == 2:
        a = random.choice([1, 2, 3, -1, -2])
        b = random.randint(-5, 5)
        c = random.randint(-4, 4)
        x = random.randint(-4, 6)
        inner = x + c
        answer = a * inner + b
        expression = _format_linear(a, b)
        sign = "+" if c >= 0 else "-"
        question = f"If $f(x) = {expression}$, find $f(x {sign} {abs(c)})$ when $x = {x}$."
        steps = [
            f"First evaluate the input: $x {sign} {abs(c)} = {x} {sign} {abs(c)} = {inner}$.",
            f"Now find $f({inner})$.",
            f"$f({inner}) = {a}({inner}) + ({b})$",
            f"$f({inner}) = {answer}$",
            f"**Final Answer:** ${answer}$",
        ]

    else:
        a = random.choice([1, 2, -1, -2])
        b = random.randint(-4, 4)
        target = random.randint(-8, 12)
        x = (target - b) / a
        while x != int(x):
            target = random.randint(-8, 12)
            x = (target - b) / a
        x = int(x)
        expression = _format_linear(a, b)
        question = f"If $f(x) = {expression}$ and $f(x) = {target}$, find $x$."
        steps = [
            f"Set the function equal to the output: ${expression} = {target}$.",
            f"Subtract ${b}$ from both sides: ${a}x = {target - b}$.",
            f"Divide by ${a}$: $x = {x}$.",
            f"**Final Answer:** ${x}$",
        ]
        answer = x

    return {
        "question": question,
        "answer": str(answer),
        "answer_numeric": answer,
        "steps": steps,
        "difficulty": difficulty,
    }
