"""Answer validation utilities."""

from fractions import Fraction
import re
from typing import Any

from sympy import N, simplify
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

TRANSFORMATIONS = standard_transformations + (
    convert_xor,
    implicit_multiplication_application,
)


def normalize_answer_text(answer: str) -> str:
    """Normalize formatting differences that do not change the math."""
    normalized = answer.strip().lower()
    normalized = normalized.replace("$", "")
    normalized = normalized.replace("\\left", "").replace("\\right", "")
    normalized = normalized.replace("\\cdot", "*").replace("·", "*").replace("×", "*")
    normalized = normalized.replace("−", "-").replace("–", "-")
    normalized = normalized.replace("\\pi", "pi").replace("π", "pi")
    normalized = normalized.replace("\\leq", "<=").replace("\\geq", ">=")
    normalized = normalized.replace("≤", "<=").replace("≥", ">=").replace("≠", "!=")
    normalized = normalized.replace("=/=", "!=").replace("\\ne", "!=").replace("\\neq", "!=")
    normalized = normalized.replace("∞", "oo").replace("infinity", "oo")
    normalized = normalized.replace("\\sqrt", "sqrt")
    normalized = re.sub(r"√\s*([0-9a-zA-Z]+)", r"sqrt(\1)", normalized)
    normalized = normalized.replace("√", "sqrt")
    normalized = normalized.replace("\\frac", "frac")
    normalized = re.sub(r"sqrt\{([^{}]+)\}", r"sqrt(\1)", normalized)
    normalized = re.sub(r"frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)", normalized)
    normalized = re.sub(r"(\d|\))\s*sqrt\(", r"\1*sqrt(", normalized)
    normalized = normalized.replace("{", "(").replace("}", ")")
    normalized = normalized.replace(" ", "")
    return normalized


def _strip_single_variable_assignment(answer: str) -> str:
    """Allow x=3 and 3 to match when the expected answer is a single value."""
    match = re.fullmatch(r"[a-zA-Z]\s*=\s*(.+)", answer.strip())
    return match.group(1) if match else answer


def _parse_single_assignment(answer: str) -> tuple[str, str] | None:
    if "," in answer:
        return None
    match = re.fullmatch(r"\s*([a-zA-Z])\s*=\s*(.+)\s*", answer)
    if not match:
        return None
    return match.group(1).lower(), match.group(2)


def parse_fraction(answer: str) -> float | None:
    """
    Parse fraction, mixed fraction, decimal, integer, or percent strings.

    Returns None if parsing fails.
    """
    answer = _strip_single_variable_assignment(answer)
    answer = answer.strip()

    try:
        mixed_match = re.match(r"^(-?\d+)\s+(\d+)/(\d+)$", answer)
        if mixed_match:
            whole = int(mixed_match.group(1))
            numerator = int(mixed_match.group(2))
            denominator = int(mixed_match.group(3))
            if whole < 0:
                return whole - (numerator / denominator)
            return whole + (numerator / denominator)

        if answer.endswith("%"):
            return float(answer[:-1]) / 100

        if "/" in answer:
            frac = Fraction(answer)
            return float(frac)

        return float(answer)

    except (ValueError, ZeroDivisionError):
        return None


def _parse_assignments(answer: str) -> dict[str, str] | None:
    normalized = normalize_answer_text(answer)
    if "=" not in normalized or "," not in normalized:
        return None

    assignments = {}
    for part in normalized.split(","):
        if "=" not in part:
            return None
        key, value = part.split("=", 1)
        if not key or not value:
            return None
        assignments[key] = value
    return assignments


def _parse_list(answer: str) -> list[str] | None:
    normalized = normalize_answer_text(answer)
    if "," not in normalized:
        return None
    if (
        (normalized.startswith("(") and normalized.endswith(")"))
        or (normalized.startswith("[") and normalized.endswith("]"))
    ):
        normalized = normalized[1:-1]
    parts = [part for part in normalized.split(",") if part]
    return parts or None


def _to_sympy(answer: str) -> Any | None:
    normalized = normalize_answer_text(_strip_single_variable_assignment(answer))
    if not normalized:
        return None

    try:
        return parse_expr(normalized, transformations=TRANSFORMATIONS)
    except Exception:
        return None


def _inequalities_equivalent(user_answer: str, correct_answer: str, tolerance: float) -> bool:
    left = normalize_answer_text(user_answer)
    right = normalize_answer_text(correct_answer)
    if left == right:
        return True

    inequality_pattern = re.compile(r"^([a-zA-Z])([<>]=?|!=)(-?\d+(?:\.\d+)?)$")
    reversed_inequality_pattern = re.compile(r"^(-?\d+(?:\.\d+)?)([<>]=?)([a-zA-Z])$")
    all_real_except_pattern = re.compile(
        r"^(?:allreal(?:numbers?)?except|real(?:numbers?)?except)(?:[a-zA-Z]=?)?(-?\d+(?:\.\d+)?)$"
    )
    value_pattern = r"(?:-?\d+(?:\.\d+)?|[+-]?oo)"
    interval_pattern = re.compile(rf"^([\[(])({value_pattern}),({value_pattern})([\])])$")

    def canonical_inequality(answer: str) -> tuple[str, str, str] | None:
        direct_match = inequality_pattern.fullmatch(answer)
        if direct_match:
            return direct_match.groups()

        all_real_except_match = all_real_except_pattern.fullmatch(answer)
        if all_real_except_match:
            return "x", "!=", all_real_except_match.group(1)

        reversed_match = reversed_inequality_pattern.fullmatch(answer)
        if not reversed_match:
            interval_match = interval_pattern.fullmatch(answer)
            if not interval_match:
                return None

            left_bracket, lower, upper, right_bracket = interval_match.groups()
            if upper in {"oo", "+oo"} and lower not in {"-oo", "oo", "+oo"}:
                return "x", ">=" if left_bracket == "[" else ">", lower
            if lower == "-oo" and upper not in {"-oo", "oo", "+oo"}:
                return "x", "<=" if right_bracket == "]" else "<", upper
            return None

        value, op, variable = reversed_match.groups()
        flipped_op = {"<": ">", "<=": ">=", ">": "<", ">=": "<="}[op]
        return variable, flipped_op, value

    left_match = canonical_inequality(left)
    right_match = canonical_inequality(right)
    if left_match and right_match:
        left_var, left_op, left_value = left_match
        right_var, right_op, right_value = right_match
        return (
            left_var == right_var
            and left_op == right_op
            and abs(float(left_value) - float(right_value)) < tolerance
        )

    left_interval = interval_pattern.fullmatch(left)
    right_interval = interval_pattern.fullmatch(right)
    if left_interval and right_interval:
        def values_match(a: str, b: str) -> bool:
            if a in {"oo", "+oo", "-oo"} or b in {"oo", "+oo", "-oo"}:
                return a == b or {a, b} == {"oo", "+oo"}
            return abs(float(a) - float(b)) < tolerance

        return (
            left_interval.group(1) == right_interval.group(1)
            and left_interval.group(4) == right_interval.group(4)
            and values_match(left_interval.group(2), right_interval.group(2))
            and values_match(left_interval.group(3), right_interval.group(3))
        )

    return False


def _sympy_equivalent(left: str, right: str, tolerance: float) -> bool:
    left_expr = _to_sympy(left)
    right_expr = _to_sympy(right)
    if left_expr is None or right_expr is None:
        return False

    try:
        difference = simplify(left_expr - right_expr)
        if difference == 0:
            return True
        numeric_difference = abs(float(N(difference)))
        return numeric_difference < tolerance
    except Exception:
        return False


def _lists_equivalent(user_answer: str, correct_answer: str, tolerance: float) -> bool:
    user_parts = _parse_list(user_answer)
    correct_parts = _parse_list(correct_answer)
    if user_parts is None or correct_parts is None or len(user_parts) != len(correct_parts):
        return False

    unmatched = correct_parts.copy()
    for user_part in user_parts:
        match_index = next(
            (
                index
                for index, correct_part in enumerate(unmatched)
                if answers_are_equivalent(user_part, correct_part, tolerance)
            ),
            None,
        )
        if match_index is None:
            return False
        unmatched.pop(match_index)
    return not unmatched


def _assignments_equivalent(user_answer: str, correct_answer: str, tolerance: float) -> bool:
    user_assignments = _parse_assignments(user_answer)
    correct_assignments = _parse_assignments(correct_answer)
    if user_assignments is None or correct_assignments is None:
        return False
    if user_assignments.keys() != correct_assignments.keys():
        return False
    return all(
        answers_are_equivalent(user_assignments[key], correct_assignments[key], tolerance)
        for key in user_assignments
    )


def answers_are_equivalent(user_answer: str, correct_answer: str, tolerance: float = 0.01) -> bool:
    """
    Check if two answers are mathematically equivalent.

    Accepts equivalent integers, decimals, fractions, mixed numbers, percentages,
    radicals, powers, variable expressions, and comma-separated lists unless the
    problem requires a specific symbolic form.
    """
    if normalize_answer_text(user_answer) == normalize_answer_text(correct_answer):
        return True

    if _inequalities_equivalent(user_answer, correct_answer, tolerance):
        return True

    user_assignment = _parse_single_assignment(user_answer)
    correct_assignment = _parse_single_assignment(correct_answer)
    if user_assignment and correct_assignment:
        user_key, user_value_text = user_assignment
        correct_key, correct_value_text = correct_assignment
        if user_key != correct_key:
            return False
        return answers_are_equivalent(user_value_text, correct_value_text, tolerance)

    if _assignments_equivalent(user_answer, correct_answer, tolerance):
        return True

    if _lists_equivalent(user_answer, correct_answer, tolerance):
        return True

    user_value = parse_fraction(user_answer)
    correct_value = parse_fraction(correct_answer)
    if user_value is not None and correct_value is not None:
        return abs(user_value - correct_value) < tolerance

    if _sympy_equivalent(user_answer, correct_answer, tolerance):
        return True

    return False
