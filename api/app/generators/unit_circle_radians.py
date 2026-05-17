"""Unit circle and radian conversion question generator."""

import random
import math
from typing import Dict, Any

# Real-world contexts for unit circle and radians
WORD_PROBLEMS = [
    {
        "context": "Rotational motion: Angles of rotation in machinery, wheels, and rotating systems.",
        "application": "Measuring angular displacement in radians for mechanical systems"
    },
    {
        "context": "Physics and calculus: Angular velocity and acceleration calculations.",
        "application": "Analyzing rotational motion dynamics"
    },
    {
        "context": "Computer graphics: Rotation transformations and angle calculations.",
        "application": "3D graphics rendering and animation systems"
    },
    {
        "context": "Navigation and GPS: Bearing and heading calculations.",
        "application": "Converting between angular measurement systems"
    },
    {
        "context": "Astronomy: Measuring celestial coordinates and angular distances.",
        "application": "Celestial mechanics and star position calculations"
    },
]


def generate_unit_circle_radians(difficulty: int = 1) -> Dict[str, Any]:
    """
    Generate unit circle and radian conversion problems.

    Args:
        difficulty: 1 (degrees to radians), 2 (radians to degrees), 3 (unit circle coordinates)

    Returns:
        Dict with question, answer, and solution steps
    """
    if difficulty == 1:
        # Easy: Convert degrees to radians (common angles)
        use_word_problem = random.random() < 0.4
        common_angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360]
        degrees = random.choice(common_angles)

        # Calculate radians in terms of pi
        radians_num = degrees
        radians_den = 180

        # Simplify the fraction
        from math import gcd
        if radians_num == 0:
            radian_str = "0"
            answer_numeric = 0
        else:
            g = gcd(radians_num, radians_den)
            num = radians_num // g
            den = radians_den // g

            if num == den:
                radian_str = "\\pi"
                answer_numeric = math.pi
            elif den == 1:
                radian_str = f"{num}\\pi"
                answer_numeric = num * math.pi
            elif num == 1:
                radian_str = f"\\frac{{\\pi}}{{{den}}}"
                answer_numeric = math.pi / den
            else:
                radian_str = f"\\frac{{{num}\\pi}}{{{den}}}"
                answer_numeric = (num * math.pi) / den

        if use_word_problem:
            question = f"**Rotational Motion:** A wheel rotates through an angle of ${degrees}°$. Express this rotation in radians, which is the standard unit in physics and engineering for angular measurements."
        else:
            question = f"Convert ${degrees}°$ to radians in terms of $\\pi$."

        steps = [
            f"**Understanding radians:**",
            f"Radians are an alternative way to measure angles, based on arc length.",
            f"The conversion formula is: radians = degrees $\\times \\frac{{\\pi}}{{180°}}$",
            "",
            f"**Why this formula?**",
            f"There are exactly $360°$ in a full circle, which equals $2\\pi$ radians.",
            f"So: $360° = 2\\pi$ radians, which gives us our conversion factor.",
            "",
            f"**Apply the conversion formula:**",
            f"radians = ${degrees}° \\times \\frac{{\\pi}}{{180°}}$",
            f"radians = $\\frac{{{degrees}\\pi}}{{180}}$",
            "",
        ]

        if radians_num != 0:
            g = gcd(radians_num, radians_den)
            if g > 1:
                steps.append(f"**Simplify the fraction:**")
                steps.append(f"Find the GCD of ${degrees}$ and $180$: GCD = ${g}$")
                steps.append(f"Divide both numerator and denominator by ${g}$:")
                steps.append(f"radians = $\\frac{{{num}\\pi}}{{{den}}}$")
            else:
                steps.append(f"**Check if simplified:**")
                steps.append(f"The fraction $\\frac{{{degrees}}}{{180}}$ is already in simplest form.")
                steps.append(f"radians = ${radian_str}$")

        steps.append("")
        steps.append(f"**Final Answer:** ${radian_str}$ radians")
        answer = radian_str

    elif difficulty == 2:
        # Medium: Convert radians to degrees
        # Common radian values (numerator, denominator)
        radian_fractions = [
            (0, 1), (1, 6), (1, 4), (1, 3), (1, 2), (2, 3), (3, 4), (5, 6),
            (1, 1), (7, 6), (5, 4), (4, 3), (3, 2), (5, 3), (7, 4), (11, 6), (2, 1)
        ]
        num, den = random.choice(radian_fractions)

        if num == 0:
            radian_str = "0"
            degrees = 0
        elif den == 1:
            if num == 1:
                radian_str = "\\pi"
            else:
                radian_str = f"{num}\\pi"
            degrees = num * 180
        elif num == 1:
            radian_str = f"\\frac{{\\pi}}{{{den}}}"
            degrees = 180 // den
        else:
            radian_str = f"\\frac{{{num}\\pi}}{{{den}}}"
            degrees = (num * 180) // den

        question = f"Convert ${radian_str}$ radians to degrees."

        steps = [
            "Use the conversion formula: degrees = radians $\\times \\frac{180}{\\pi}$",
            f"Substitute: degrees = ${radian_str} \\times \\frac{{180}}{{\\pi}}$",
        ]

        if num == 0:
            steps.append("Calculate: degrees = $0$")
        elif den == 1:
            steps.append(f"Simplify: degrees = ${num} \\times 180 = {degrees}°$")
        else:
            steps.append(f"Simplify: degrees = $\\frac{{{num} \\times 180}}{{{den}}}$")
            steps.append(f"Calculate: degrees = $\\frac{{{num * 180}}}{{{den}}} = {degrees}°$")

        steps.append(f"**Final Answer:** ${degrees}°$")
        answer_numeric = degrees
        answer = str(degrees)

    else:
        # Hard: Find coordinates on the unit circle
        # Common angles with known exact values
        unit_circle_values = [
            (0, "0", 1, 0),
            (30, "\\frac{\\pi}{6}", math.sqrt(3)/2, 0.5),
            (45, "\\frac{\\pi}{4}", math.sqrt(2)/2, math.sqrt(2)/2),
            (60, "\\frac{\\pi}{3}", 0.5, math.sqrt(3)/2),
            (90, "\\frac{\\pi}{2}", 0, 1),
            (120, "\\frac{2\\pi}{3}", -0.5, math.sqrt(3)/2),
            (135, "\\frac{3\\pi}{4}", -math.sqrt(2)/2, math.sqrt(2)/2),
            (150, "\\frac{5\\pi}{6}", -math.sqrt(3)/2, 0.5),
            (180, "\\pi", -1, 0),
            (210, "\\frac{7\\pi}{6}", -math.sqrt(3)/2, -0.5),
            (225, "\\frac{5\\pi}{4}", -math.sqrt(2)/2, -math.sqrt(2)/2),
            (240, "\\frac{4\\pi}{3}", -0.5, -math.sqrt(3)/2),
            (270, "\\frac{3\\pi}{2}", 0, -1),
            (300, "\\frac{5\\pi}{3}", 0.5, -math.sqrt(3)/2),
            (315, "\\frac{7\\pi}{4}", math.sqrt(2)/2, -math.sqrt(2)/2),
            (330, "\\frac{11\\pi}{6}", math.sqrt(3)/2, -0.5),
        ]

        degrees, radian_str, cos_val, sin_val = random.choice(unit_circle_values)

        # Format the exact values as strings
        if cos_val == 0:
            cos_str = "0"
        elif cos_val == 1:
            cos_str = "1"
        elif cos_val == -1:
            cos_str = "-1"
        elif abs(cos_val) == 0.5:
            cos_str = "\\frac{1}{2}" if cos_val > 0 else "-\\frac{1}{2}"
        elif abs(cos_val) == math.sqrt(2)/2:
            cos_str = "\\frac{\\sqrt{2}}{2}" if cos_val > 0 else "-\\frac{\\sqrt{2}}{2}"
        elif abs(cos_val) == math.sqrt(3)/2:
            cos_str = "\\frac{\\sqrt{3}}{2}" if cos_val > 0 else "-\\frac{\\sqrt{3}}{2}"

        if sin_val == 0:
            sin_str = "0"
        elif sin_val == 1:
            sin_str = "1"
        elif sin_val == -1:
            sin_str = "-1"
        elif abs(sin_val) == 0.5:
            sin_str = "\\frac{1}{2}" if sin_val > 0 else "-\\frac{1}{2}"
        elif abs(sin_val) == math.sqrt(2)/2:
            sin_str = "\\frac{\\sqrt{2}}{2}" if sin_val > 0 else "-\\frac{\\sqrt{2}}{2}"
        elif abs(sin_val) == math.sqrt(3)/2:
            sin_str = "\\frac{\\sqrt{3}}{2}" if sin_val > 0 else "-\\frac{\\sqrt{3}}{2}"

        question = f"Find the coordinates $(x, y)$ on the unit circle at angle ${radian_str}$ radians."

        steps = [
            "On the unit circle, coordinates are $(\\cos\\theta, \\sin\\theta)$",
            f"For $\\theta = {radian_str}$ (which is ${degrees}°$):",
            f"$x = \\cos({radian_str}) = {cos_str}$",
            f"$y = \\sin({radian_str}) = {sin_str}$",
            f"**Final Answer:** $({cos_str}, {sin_str})$"
        ]

        answer_numeric = None
        answer = f"{cos_str},{sin_str}"

    return {
        "question": question,
        "answer": answer,
        "answer_numeric": answer_numeric,
        "steps": steps,
        "difficulty": difficulty,
    }
