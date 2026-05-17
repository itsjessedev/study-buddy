"""Regression tests for the Calc I readiness catalog."""

import json
import re
import unittest
from pathlib import Path

from app.generators import GENERATORS


ROOT = Path(__file__).resolve().parents[2]

EXPECTED_GENERATORS = {
    "fractions": "course_fractions",
    "solving-equations": "course_solving_equations",
    "exponent-rules": "exponent_rules",
    "factoring": "course_factoring",
    "quadratic-solving": "quadratic_equation",
    "rational-expressions": "rational_expressions",
    "inequalities-intervals": "inequalities_intervals",
    "function-notation": "function_notation",
    "domain-range": "domain_range",
    "graphs-and-slope": "course_graphs_and_slope",
    "composition-inverses": "composition_inverses",
    "piecewise-transformations": "piecewise_transformations",
    "polynomial-rational-graphs": "polynomial_rational_graphs",
    "radicals": "radical_expressions",
    "logs-exponentials": "logs_exponentials",
    "basic-trig": "sine_cosine_tangent",
    "unit-circle-radians": "unit_circle_radians",
    "trig-identities": "trig_identities",
    "trig-graphs": "trig_graphs_calc_ready",
    "inverse-trig-basics": "inverse_trig_functions",
}


class CourseCatalogTest(unittest.TestCase):
    def setUp(self):
        with open(ROOT / "content" / "skills.json", "r") as f:
            self.skills = json.load(f)["skills"]

    def test_current_catalog_is_calc_readiness_only(self):
        slugs = [skill["slug"] for skill in self.skills]

        self.assertEqual(slugs, list(EXPECTED_GENERATORS.keys()))
        self.assertNotIn("calculus-1", slugs)
        self.assertFalse(any("calculus" in skill["name"].lower() for skill in self.skills))

    def test_every_catalog_skill_has_a_lesson(self):
        lessons_source = (ROOT / "web" / "src" / "data" / "lessons.ts").read_text()
        lesson_slugs = set(re.findall(r"slug: '([^']+)'", lessons_source))
        catalog_slugs = {skill["slug"] for skill in self.skills}

        self.assertEqual(catalog_slugs - lesson_slugs, set())

    def test_every_catalog_skill_has_a_registered_generator(self):
        for slug, generator_name in EXPECTED_GENERATORS.items():
            self.assertIn(generator_name, GENERATORS, f"{slug} is missing {generator_name}")

            for difficulty in [1, 2, 3]:
                with self.subTest(slug=slug, difficulty=difficulty):
                    generated = GENERATORS[generator_name](difficulty)
                    self.assertTrue(generated.get("question"))
                    self.assertTrue(generated.get("answer") is not None)
                    self.assertTrue(generated.get("steps"))

    def test_exact_answer_generators_do_not_force_decimal_only(self):
        for difficulty in [1, 3]:
            generated = GENERATORS["unit_circle_radians"](difficulty)
            self.assertNotRegex(generated["answer"], r"^-?\d+\.\d+$")

        for _ in range(20):
            generated = GENERATORS["rational_expressions"](2)
            self.assertNotRegex(generated["answer"], r"^-?\d+/-?\d+x$")


if __name__ == "__main__":
    unittest.main()
