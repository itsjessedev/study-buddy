"""Question generator modules."""

from typing import Dict, Callable, Any
from app.generators.linear_equation import generate_linear_equation
from app.generators.fraction_operations import generate_fraction_addition
from app.generators.quadratic_equation import generate_quadratic_equation
from app.generators.systems_equations import generate_system_of_equations
from app.generators.polynomial_operations import generate_polynomial_operation
from app.generators.order_of_operations import generate_order_of_operations
from app.generators.distributive_property import generate_distributive_property
from app.generators.combining_like_terms import generate_combining_like_terms
from app.generators.evaluating_expressions import generate_evaluating_expressions
from app.generators.inequalities import generate_inequality
from app.generators.exponent_rules import generate_exponent_rules
from app.generators.slope_intercept import generate_slope_intercept
from app.generators.integers_operations import generate_integers_operations
from app.generators.absolute_value import generate_absolute_value
from app.generators.fractions_multiplication import generate_fractions_multiplication
from app.generators.fractions_division import generate_fractions_division
from app.generators.percentages import generate_percentages
from app.generators.decimals_operations import generate_decimals_operations
from app.generators.ratios_proportions import generate_ratios_proportions
from app.generators.unit_conversions import generate_unit_conversions
from app.generators.simple_interest import generate_simple_interest
from app.generators.pythagorean_theorem import generate_pythagorean_theorem
from app.generators.factoring_quadratics import generate_factoring_quadratics
from app.generators.factoring_polynomials import generate_factoring_polynomials
from app.generators.equations_variables_both_sides import generate_equations_variables_both_sides
from app.generators.graphing_linear_equations import generate_graphing_linear_equations
from app.generators.point_slope_form import generate_point_slope_form
from app.generators.quadratic_formula import generate_quadratic_formula
from app.generators.scientific_notation import generate_scientific_notation
from app.generators.rational_expressions import generate_rational_expressions
from app.generators.radical_expressions import generate_radical_expressions
from app.generators.function_composition import generate_function_composition
from app.generators.inverse_functions import generate_inverse_functions
from app.generators.piecewise_functions import generate_piecewise_functions
from app.generators.polynomial_long_division import generate_polynomial_long_division
from app.generators.rational_functions import generate_rational_functions
from app.generators.conic_sections import generate_conic_sections
from app.generators.parametric_equations import generate_parametric_equations
from app.generators.polar_coordinates import generate_polar_coordinates
from app.generators.vectors import generate_vectors
from app.generators.matrices import generate_matrices
from app.generators.unit_circle_radians import generate_unit_circle_radians
from app.generators.sine_cosine_tangent import generate_sine_cosine_tangent
from app.generators.pythagorean_identities import generate_pythagorean_identities
from app.generators.graphing_trig_functions import generate_graphing_trig_functions
from app.generators.inverse_trig_functions import generate_inverse_trig_functions
from app.generators.law_of_sines import generate_law_of_sines
from app.generators.law_of_cosines import generate_law_of_cosines
from app.generators.trigonometric_equations import generate_trigonometric_equations
from app.generators.course_fractions import generate_course_fractions
from app.generators.course_solving_equations import generate_course_solving_equations
from app.generators.course_factoring import generate_course_factoring
from app.generators.course_graphs_and_slope import generate_course_graphs_and_slope
from app.generators.function_notation import generate_function_notation
from app.generators.logs_exponentials import generate_logs_exponentials

# Registry of generator functions by template type
GENERATORS: Dict[str, Callable[[int], Dict[str, Any]]] = {
    "linear_equation": generate_linear_equation,
    "fraction_addition": generate_fraction_addition,
    "quadratic_equation": generate_quadratic_equation,
    "system_of_equations": generate_system_of_equations,
    "polynomial_operation": generate_polynomial_operation,
    "order_of_operations": generate_order_of_operations,
    "distributive_property": generate_distributive_property,
    "combining_like_terms": generate_combining_like_terms,
    "evaluating_expressions": generate_evaluating_expressions,
    "inequality": generate_inequality,
    "exponent_rules": generate_exponent_rules,
    "slope_intercept": generate_slope_intercept,
    "integers_operations": generate_integers_operations,
    "absolute_value": generate_absolute_value,
    "fractions_multiplication": generate_fractions_multiplication,
    "fractions_division": generate_fractions_division,
    "percentages": generate_percentages,
    "decimals_operations": generate_decimals_operations,
    "ratios_proportions": generate_ratios_proportions,
    "unit_conversions": generate_unit_conversions,
    "simple_interest": generate_simple_interest,
    "pythagorean_theorem": generate_pythagorean_theorem,
    "factoring_quadratics": generate_factoring_quadratics,
    "factoring_polynomials": generate_factoring_polynomials,
    "equations_variables_both_sides": generate_equations_variables_both_sides,
    "graphing_linear_equations": generate_graphing_linear_equations,
    "point_slope_form": generate_point_slope_form,
    "quadratic_formula": generate_quadratic_formula,
    "scientific_notation": generate_scientific_notation,
    "rational_expressions": generate_rational_expressions,
    "radical_expressions": generate_radical_expressions,
    "function_composition": generate_function_composition,
    "inverse_functions": generate_inverse_functions,
    "piecewise_functions": generate_piecewise_functions,
    "polynomial_long_division": generate_polynomial_long_division,
    "rational_functions": generate_rational_functions,
    "conic_sections": generate_conic_sections,
    "parametric_equations": generate_parametric_equations,
    "polar_coordinates": generate_polar_coordinates,
    "vectors": generate_vectors,
    "matrices": generate_matrices,
    "unit_circle_radians": generate_unit_circle_radians,
    "sine_cosine_tangent": generate_sine_cosine_tangent,
    "pythagorean_identities": generate_pythagorean_identities,
    "graphing_trig_functions": generate_graphing_trig_functions,
    "inverse_trig_functions": generate_inverse_trig_functions,
    "law_of_sines": generate_law_of_sines,
    "law_of_cosines": generate_law_of_cosines,
    "trigonometric_equations": generate_trigonometric_equations,
    "course_fractions": generate_course_fractions,
    "course_solving_equations": generate_course_solving_equations,
    "course_factoring": generate_course_factoring,
    "course_graphs_and_slope": generate_course_graphs_and_slope,
    "function_notation": generate_function_notation,
    "logs_exponentials": generate_logs_exponentials,
}


def get_generator(template_type: str) -> Callable[[int], Dict[str, Any]]:
    """Get generator function for a template type."""
    if template_type not in GENERATORS:
        raise ValueError(f"Unknown template type: {template_type}")
    return GENERATORS[template_type]
