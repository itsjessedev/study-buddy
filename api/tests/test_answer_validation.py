"""Regression tests for flexible answer validation."""

import unittest

from app.utils.answer_validation import answers_are_equivalent


class AnswerValidationTest(unittest.TestCase):
    def test_accepts_fraction_decimal_equivalence(self):
        self.assertTrue(answers_are_equivalent("1/2", "0.5"))
        self.assertTrue(answers_are_equivalent("1 1/2", "1.5"))
        self.assertTrue(answers_are_equivalent("x = 3/4", "0.75"))

    def test_accepts_equivalent_radicals(self):
        self.assertTrue(answers_are_equivalent("sqrt(8)", "2√2"))
        self.assertTrue(answers_are_equivalent("5sqrt(2)", "5√2"))
        self.assertTrue(answers_are_equivalent("\\frac{\\sqrt{2}}{2}", "sqrt(2)/2"))

    def test_accepts_equivalent_exponents(self):
        self.assertTrue(answers_are_equivalent("x^7", "x**7"))
        self.assertTrue(answers_are_equivalent("a^(5+2)", "a^7"))

    def test_accepts_equivalent_algebra_forms(self):
        self.assertTrue(answers_are_equivalent("x^2 + 1 + 2x", "x^2+2x+1"))
        self.assertTrue(answers_are_equivalent("(x + 1)^2", "x^2+2x+1"))

    def test_accepts_percent_decimal_equivalence(self):
        self.assertTrue(answers_are_equivalent("25%", "0.25"))

    def test_accepts_inequality_symbol_variants(self):
        self.assertTrue(answers_are_equivalent("x >= 3", "x ≥ 3"))
        self.assertTrue(answers_are_equivalent("3 < x", "x > 3"))
        self.assertTrue(answers_are_equivalent("x != -2", "x≠-2"))
        self.assertFalse(answers_are_equivalent("x > 3", "x >= 3"))

    def test_accepts_interval_and_domain_variants(self):
        self.assertTrue(answers_are_equivalent("(2,8]", "(2, 8]"))
        self.assertTrue(answers_are_equivalent("[4, infinity)", "x >= 4"))
        self.assertTrue(answers_are_equivalent("all real except 2", "x != 2"))

    def test_accepts_pi_latex_equivalence(self):
        self.assertTrue(answers_are_equivalent("\\frac{\\pi}{6}", "pi/6"))
        self.assertTrue(answers_are_equivalent("π/4", "pi/4"))

    def test_accepts_coordinate_tuple_lists(self):
        self.assertTrue(answers_are_equivalent("(1/2, sqrt(3)/2)", "sqrt(3)/2, 1/2"))

    def test_accepts_unordered_factor_pairs(self):
        self.assertTrue(answers_are_equivalent("4, 3", "3,4"))
        self.assertFalse(answers_are_equivalent("2, 6", "3,4"))

    def test_accepts_assignment_lists_by_name(self):
        self.assertTrue(answers_are_equivalent("b=3, m=2", "m=2,b=3"))
        self.assertTrue(answers_are_equivalent("m=1/2,b=3", "b=3,m=0.5"))

    def test_rejects_wrong_single_assignment_variable(self):
        self.assertFalse(answers_are_equivalent("x=3", "y=3"))


if __name__ == "__main__":
    unittest.main()
