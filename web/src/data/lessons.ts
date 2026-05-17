export interface LessonCheckpoint {
  prompt: string;
  answer: string;
  hint: string;
}

export interface LessonScene {
  title: string;
  narration: string;
  math: string;
  highlight?: string;
  checkpoint?: LessonCheckpoint;
}

export interface Lesson {
  slug: string;
  title: string;
  focus: string;
  scenes: LessonScene[];
}

export const LESSONS: Record<string, Lesson> = {
  fractions: {
    slug: 'fractions',
    title: 'Fractions',
    focus: 'Fraction fluency keeps algebra, slope, rates of change, and trig values from becoming the hard part of Calc I.',
    scenes: [
      {
        title: 'Build a common denominator',
        narration: 'Adding fractions starts by rewriting each denominator as the same size piece.',
        math: '\\frac{2}{3}+\\frac{1}{4}=\\frac{8}{12}+\\frac{3}{12}',
        highlight: '12',
      },
      {
        title: 'Combine the matching pieces',
        narration: 'Once the denominators match, add only the numerators and leave the denominator fixed.',
        math: '\\frac{8}{12}+\\frac{3}{12}=\\frac{11}{12}',
        highlight: '8+3=11',
      },
      {
        title: 'Checkpoint: add fractions',
        narration: 'Use the least common denominator, then combine the numerators.',
        math: '\\frac{1}{2}+\\frac{1}{3}=\\frac{?}{6}',
        checkpoint: {
          prompt: 'What numerator goes over 6?',
          answer: '5',
          hint: 'Rewrite 1/2 as 3/6 and 1/3 as 2/6.',
        },
      },
      {
        title: 'Multiply straight across',
        narration: 'For multiplication, multiply numerators together and denominators together.',
        math: '\\frac{3}{5}\\cdot\\frac{10}{9}=\\frac{30}{45}',
        highlight: '\\frac{30}{45}',
      },
      {
        title: 'Reduce before or after',
        narration: 'Simplify common factors so the final fraction is easier to use in later algebra.',
        math: '\\frac{30}{45}=\\frac{2}{3}',
        highlight: '\\frac{2}{3}',
      },
      {
        title: 'Checkpoint: reduce a result',
        narration: 'Calc I problems often expect exact simplified answers, not decimal estimates.',
        math: '\\frac{18}{24}=?',
        checkpoint: {
          prompt: 'Enter the reduced fraction.',
          answer: '3/4',
          hint: 'Divide the numerator and denominator by 6.',
        },
      },
    ],
  },
  'solving-equations': {
    slug: 'solving-equations',
    title: 'Solving Equations',
    focus: 'Solving quickly helps you isolate variables in formulas, intersections, tangent-line work, and optimization setup.',
    scenes: [
      {
        title: 'Protect the balance',
        narration: 'An equation stays true only when the same operation is applied to both sides.',
        math: '3x+7=22',
        highlight: '=',
      },
      {
        title: 'Undo addition first',
        narration: 'Clear the constant term before undoing the coefficient on the variable.',
        math: '3x+7-7=22-7\\Rightarrow 3x=15',
        highlight: '3x=15',
      },
      {
        title: 'Checkpoint: isolate the variable',
        narration: 'The variable term is isolated. Now undo multiplication.',
        math: '3x=15',
        checkpoint: {
          prompt: 'What do you divide both sides by?',
          answer: '3',
          hint: 'Use the coefficient attached to x.',
        },
      },
      {
        title: 'Clear a denominator',
        narration: 'When a variable sits in a fraction, multiply both sides by the denominator.',
        math: '\\frac{x}{4}-2=5\\Rightarrow \\frac{x}{4}=7',
        highlight: '\\frac{x}{4}=7',
      },
      {
        title: 'Finish the equation',
        narration: 'Multiplying both sides by 4 gives the exact value of x.',
        math: '4\\cdot\\frac{x}{4}=7\\cdot4\\Rightarrow x=28',
        highlight: 'x=28',
      },
      {
        title: 'Checkpoint: solve a linear equation',
        narration: 'Work backward from the outside operation to the inside operation.',
        math: '2x-5=13',
        checkpoint: {
          prompt: 'What is x?',
          answer: '9',
          hint: 'Add 5 to get 2x = 18, then divide by 2.',
        },
      },
    ],
  },
  'exponent-rules': {
    slug: 'exponent-rules',
    title: 'Exponent Rules',
    focus: 'Exponent rules turn messy powers into readable algebra, especially before power-rule derivatives and radical rewrites.',
    scenes: [
      {
        title: 'Multiply powers with the same base',
        narration: 'Same-base multiplication adds exponents because the repeated factors join together.',
        math: 'x^3\\cdot x^4=x^{3+4}=x^7',
        highlight: '3+4',
      },
      {
        title: 'Checkpoint: product rule',
        narration: 'Keep the base and add the exponents.',
        math: 'a^5\\cdot a^2=a^?',
        checkpoint: {
          prompt: 'What is the new exponent?',
          answer: '7',
          hint: 'Add 5 and 2.',
        },
      },
      {
        title: 'Divide powers with the same base',
        narration: 'Same-base division subtracts exponents because common factors cancel.',
        math: '\\frac{x^8}{x^3}=x^{8-3}=x^5',
        highlight: '8-3',
      },
      {
        title: 'Power of a power',
        narration: 'Raising a power to another power multiplies the exponents.',
        math: '(x^2)^5=x^{2\\cdot5}=x^{10}',
        highlight: '2\\cdot5',
      },
      {
        title: 'Negative exponents mean reciprocals',
        narration: 'A negative exponent moves the factor across the fraction bar.',
        math: 'x^{-3}=\\frac{1}{x^3}',
        highlight: '\\frac{1}{x^3}',
      },
      {
        title: 'Checkpoint: simplify a power',
        narration: 'Combine the power rule with the quotient rule.',
        math: '\\frac{(x^3)^2}{x^4}=x^?',
        checkpoint: {
          prompt: 'What exponent remains on x?',
          answer: '2',
          hint: '(x^3)^2 is x^6, then subtract 4.',
        },
      },
    ],
  },
  factoring: {
    slug: 'factoring',
    title: 'Factoring',
    focus: 'Factoring reveals zeros, cancellations, and structure that Calc I uses in limits, graph behavior, and derivative setup.',
    scenes: [
      {
        title: 'Start with common factors',
        narration: 'Before using a pattern, check whether every term shares a factor.',
        math: '6x^2+9x=3x(2x+3)',
        highlight: '3x',
      },
      {
        title: 'Factor simple trinomials',
        narration: 'For x squared plus bx plus c, find two numbers that multiply to c and add to b.',
        math: 'x^2+5x+6=(x+2)(x+3)',
        highlight: '2,3',
      },
      {
        title: 'Checkpoint: find the pair',
        narration: 'The binomial constants come from the multiply-and-add pair.',
        math: 'x^2+7x+12=(x+?)(x+?)',
        checkpoint: {
          prompt: 'Enter the two numbers, separated by a comma.',
          answer: '3,4|4,3',
          hint: 'They multiply to 12 and add to 7.',
        },
      },
      {
        title: 'Use difference of squares',
        narration: 'A square minus a square factors into conjugates.',
        math: 'x^2-16=(x-4)(x+4)',
        highlight: '(x-4)(x+4)',
      },
      {
        title: 'Connect factors to zeros',
        narration: 'If a product equals zero, at least one factor must equal zero.',
        math: '(x-4)(x+4)=0\\Rightarrow x=4\\text{ or }x=-4',
        highlight: 'x=\\pm4',
      },
      {
        title: 'Checkpoint: factor completely',
        narration: 'Look for the difference-of-squares pattern.',
        math: 'x^2-25=?',
        checkpoint: {
          prompt: 'Enter the factored form.',
          answer: '(x-5)(x+5)|(x+5)(x-5)',
          hint: '25 is 5 squared, so use conjugate factors.',
        },
      },
    ],
  },
  'function-notation': {
    slug: 'function-notation',
    title: 'Function Notation',
    focus: 'Function notation is the language of limits, derivatives, composition, transformations, and graph interpretation.',
    scenes: [
      {
        title: 'Read f(x) as an instruction',
        narration: 'The formula tells you what to do to an input, not just how to draw a graph.',
        math: 'f(x)=2x-3',
        highlight: 'x',
      },
      {
        title: 'Substitute a number',
        narration: 'To find f(4), replace every x with 4 and simplify.',
        math: 'f(4)=2(4)-3=5',
        highlight: '5',
      },
      {
        title: 'Checkpoint: evaluate a function',
        narration: 'Use ordinary order of operations after substitution.',
        math: 'g(x)=x^2+1,\\quad g(3)=?',
        checkpoint: {
          prompt: 'What is g(3)?',
          answer: '10',
          hint: 'Square 3, then add 1.',
        },
      },
      {
        title: 'Substitute an expression',
        narration: 'In calculus, the input is often x plus a small change, so keep parentheses around the input.',
        math: 'f(x+h)=2(x+h)-3',
        highlight: 'x+h',
      },
      {
        title: 'Simplify carefully',
        narration: 'Distribute only after the substitution is clear.',
        math: '2(x+h)-3=2x+2h-3',
        highlight: '2h',
      },
      {
        title: 'Checkpoint: expression input',
        narration: 'Treat the whole expression as the input.',
        math: 'p(x)=x^2,\\quad p(x+1)=?',
        checkpoint: {
          prompt: 'Enter the expanded result.',
          answer: 'x^2+2x+1',
          hint: '(x + 1)^2 expands to x^2 + 2x + 1.',
        },
      },
    ],
  },
  'graphs-and-slope': {
    slug: 'graphs-and-slope',
    title: 'Graphs and Slope',
    focus: 'Slope is the pre-calculus version of rate of change, the central idea behind derivatives.',
    scenes: [
      {
        title: 'Slope is change in y over change in x',
        narration: 'Between two points, slope compares vertical change to horizontal change.',
        math: 'm=\\frac{y_2-y_1}{x_2-x_1}=\\frac{\\Delta y}{\\Delta x}',
        highlight: '\\frac{\\Delta y}{\\Delta x}',
      },
      {
        title: 'Substitute two points',
        narration: 'From (1, 2) to (4, 8), y increases by 6 while x increases by 3.',
        math: 'm=\\frac{8-2}{4-1}=\\frac{6}{3}=2',
        highlight: '2',
      },
      {
        title: 'Checkpoint: calculate slope',
        narration: 'Compute rise over run from the ordered pairs.',
        math: '(2,5)\\rightarrow(6,13)',
        checkpoint: {
          prompt: 'What is the slope?',
          answer: '2',
          hint: 'Rise is 8 and run is 4.',
        },
      },
      {
        title: 'Use point-slope form',
        narration: 'A slope and a point give the equation of a line.',
        math: 'y-y_1=m(x-x_1)',
        highlight: 'm',
      },
      {
        title: 'Build a line from a point',
        narration: 'With slope 2 through (1, 3), substitute m, x1, and y1.',
        math: 'y-3=2(x-1)\\Rightarrow y=2x+1',
        highlight: 'y=2x+1',
      },
      {
        title: 'Checkpoint: find an intercept',
        narration: 'Slope-intercept form shows the y-intercept immediately.',
        math: 'y=3x-4',
        checkpoint: {
          prompt: 'What is the y-intercept?',
          answer: '-4',
          hint: 'In y = mx + b, the y-intercept is b.',
        },
      },
    ],
  },
  radicals: {
    slug: 'radicals',
    title: 'Radicals',
    focus: 'Radical rules support exact answers, distance formulas, trig values, and rewriting powers for Calc I.',
    scenes: [
      {
        title: 'Find a perfect-square factor',
        narration: 'To simplify a square root, split out the largest perfect square factor you can see.',
        math: '\\sqrt{72}=\\sqrt{36\\cdot2}',
        highlight: '36\\cdot2',
      },
      {
        title: 'Move the square root outside',
        narration: 'The square root of 36 is 6, and the leftover factor stays under the radical.',
        math: '\\sqrt{36\\cdot2}=6\\sqrt{2}',
        highlight: '6\\sqrt{2}',
      },
      {
        title: 'Checkpoint: simplify a radical',
        narration: 'Look for the largest square factor first.',
        math: '\\sqrt{50}=?\\sqrt{2}',
        checkpoint: {
          prompt: 'What number goes outside?',
          answer: '5',
          hint: '50 is 25 times 2.',
        },
      },
      {
        title: 'Multiply matching radicals',
        narration: 'Radicals with the same index can multiply under one radical, then simplify.',
        math: '\\sqrt{3}\\cdot\\sqrt{12}=\\sqrt{36}=6',
        highlight: '6',
      },
      {
        title: 'Rewrite radicals as exponents',
        narration: 'Square roots can be written with exponent one-half, which connects directly to power rules.',
        math: '\\sqrt{x}=x^{1/2}',
        highlight: 'x^{1/2}',
      },
      {
        title: 'Checkpoint: exponent form',
        narration: 'Use fractional exponents to connect radicals with exponent rules.',
        math: '\\sqrt{x^5}=x^?',
        checkpoint: {
          prompt: 'Enter the exponent.',
          answer: '5/2',
          hint: 'A square root is the same as raising to the 1/2 power.',
        },
      },
    ],
  },
  'logs-exponentials': {
    slug: 'logs-exponentials',
    title: 'Logs and Exponentials',
    focus: 'Logs and exponentials model growth, inverses, and rates that appear throughout Calc I applications.',
    scenes: [
      {
        title: 'Translate the logarithm',
        narration: 'A logarithm asks which exponent makes the exponential statement true.',
        math: '\\log_2(8)=?\\quad\\Longleftrightarrow\\quad2^?=8',
        highlight: '2^?=8',
      },
      {
        title: 'Answer the exponent question',
        narration: 'Since 2 cubed equals 8, the logarithm equals 3.',
        math: '2^3=8\\Rightarrow\\log_2(8)=3',
        highlight: '3',
      },
      {
        title: 'Checkpoint: evaluate a log',
        narration: 'Convert the log into an exponent question.',
        math: '\\log_3(81)=?',
        checkpoint: {
          prompt: 'What is the value?',
          answer: '4',
          hint: '3 to what power equals 81?',
        },
      },
      {
        title: 'Use inverse operations',
        narration: 'Exponentials and logs undo each other when the base matches.',
        math: '\\log_5(5^x)=x',
        highlight: 'x',
      },
      {
        title: 'Solve an exponential equation',
        narration: 'When bases match, match the exponents.',
        math: '2^{x+1}=16=2^4\\Rightarrow x+1=4',
        highlight: 'x+1=4',
      },
      {
        title: 'Checkpoint: solve for the exponent',
        narration: 'Rewrite the right side using the same base, then solve the simple equation.',
        math: '3^{x-2}=27',
        checkpoint: {
          prompt: 'What is x?',
          answer: '5',
          hint: '27 is 3^3, so x - 2 = 3.',
        },
      },
    ],
  },
  'basic-trig': {
    slug: 'basic-trig',
    title: 'Basic Trig',
    focus: 'Trig basics support unit-circle values, graph behavior, related rates, and many Calc I examples.',
    scenes: [
      {
        title: 'Name the right-triangle ratios',
        narration: 'Sine, cosine, and tangent compare sides relative to an angle.',
        math: '\\sin(\\theta)=\\frac{\\text{opp}}{\\text{hyp}},\\quad\\cos(\\theta)=\\frac{\\text{adj}}{\\text{hyp}},\\quad\\tan(\\theta)=\\frac{\\text{opp}}{\\text{adj}}',
        highlight: '\\frac{\\text{opp}}{\\text{hyp}}',
      },
      {
        title: 'Use a standard angle',
        narration: 'In a 30-60-90 triangle, the side opposite 30 degrees is half the hypotenuse.',
        math: '\\sin(30^\\circ)=\\frac{1}{2}',
        highlight: '\\frac{1}{2}',
      },
      {
        title: 'Checkpoint: standard cosine',
        narration: 'Cosine at 60 degrees uses the same side ratio as sine at 30 degrees.',
        math: '\\cos(60^\\circ)=?',
        checkpoint: {
          prompt: 'What is cos(60 degrees)?',
          answer: '1/2',
          hint: 'Cosine at 60 degrees matches sine at 30 degrees.',
        },
      },
      {
        title: 'Move to the unit circle',
        narration: 'On the unit circle, cosine is the x-coordinate and sine is the y-coordinate.',
        math: '(\\cos\\theta,\\sin\\theta)',
        highlight: '\\cos\\theta',
      },
      {
        title: 'Connect tangent to sine and cosine',
        narration: 'Tangent is sine divided by cosine when cosine is not zero.',
        math: '\\tan(\\theta)=\\frac{\\sin(\\theta)}{\\cos(\\theta)}',
        highlight: '\\frac{\\sin(\\theta)}{\\cos(\\theta)}',
      },
      {
        title: 'Checkpoint: tangent from ratios',
        narration: 'Use the standard 45 degree values to form sine over cosine.',
        math: '\\tan(45^\\circ)=?',
        checkpoint: {
          prompt: 'What is tan(45 degrees)?',
          answer: '1',
          hint: 'At 45 degrees, sine and cosine are equal.',
        },
      },
    ],
  },
  'rational-expressions': {
    slug: 'rational-expressions',
    title: 'Rational Expressions',
    focus: 'Rational expressions show up in difference quotients, limit simplification, rates, and algebraic cleanup before calculus can happen.',
    scenes: [
      {
        title: 'Factor before canceling',
        narration: 'Cancel only common factors, not terms. Factoring first makes the factors visible.',
        math: '\\frac{x^2-9}{x^2+3x}=\\frac{(x-3)(x+3)}{x(x+3)}',
        highlight: '(x+3)',
      },
      {
        title: 'Cancel the shared factor',
        narration: 'The matching factor divides out, but the original denominator still tells you where the expression was undefined.',
        math: '\\frac{(x-3)(x+3)}{x(x+3)}=\\frac{x-3}{x},\\quad x\\ne0,-3',
        highlight: '\\frac{x-3}{x}',
      },
      {
        title: 'Checkpoint: simplify a rational expression',
        narration: 'Use the difference-of-squares pattern, then cancel the shared factor.',
        math: '\\frac{x^2-16}{x+4}=?',
        checkpoint: {
          prompt: 'Enter the simplified expression.',
          answer: 'x-4',
          hint: 'x^2 - 16 factors as (x - 4)(x + 4).',
        },
      },
      {
        title: 'Find a common denominator',
        narration: 'Adding algebraic fractions works like adding number fractions: rewrite with a shared denominator.',
        math: '\\frac{1}{x}+\\frac{1}{x+2}=\\frac{x+2}{x(x+2)}+\\frac{x}{x(x+2)}',
        highlight: 'x(x+2)',
      },
      {
        title: 'Combine the numerator',
        narration: 'Once denominators match, combine only the top. Keep the denominator intact.',
        math: '\\frac{x+2}{x(x+2)}+\\frac{x}{x(x+2)}=\\frac{2x+2}{x(x+2)}',
        highlight: '2x+2',
      },
      {
        title: 'Checkpoint: denominator restriction',
        narration: 'Restrictions come from denominator values that make the original expression undefined.',
        math: '\\frac{x-1}{x+4}',
        checkpoint: {
          prompt: 'What value of x is not allowed?',
          answer: '-4',
          hint: 'Set the denominator equal to zero.',
        },
      },
    ],
  },
  'inequalities-intervals': {
    slug: 'inequalities-intervals',
    title: 'Inequalities and Intervals',
    focus: 'Inequalities and interval notation describe domains, graph windows, sign charts, and where functions behave a certain way.',
    scenes: [
      {
        title: 'Solve like an equation',
        narration: 'Most inequality steps are the same as equation steps: isolate the variable while preserving the comparison.',
        math: 'x+5<12\\Rightarrow x<7',
        highlight: 'x<7',
      },
      {
        title: 'Flip when multiplying by a negative',
        narration: 'Multiplying or dividing both sides by a negative reverses the direction of the inequality.',
        math: '-2x<6\\Rightarrow x>-3',
        highlight: '>',
      },
      {
        title: 'Checkpoint: solve an inequality',
        narration: 'Divide by the negative coefficient and reverse the sign.',
        math: '-3x\\ge12',
        checkpoint: {
          prompt: 'Enter the solution.',
          answer: 'x<=-4|-4>=x',
          hint: 'Dividing by -3 flips greater-than-or-equal to less-than-or-equal.',
        },
      },
      {
        title: 'Use brackets and parentheses',
        narration: 'A bracket includes an endpoint. A parenthesis leaves it out.',
        math: '1\\le x<5\\quad\\Longleftrightarrow\\quad [1,5)',
        highlight: '[1,5)',
      },
      {
        title: 'Read compound inequalities',
        narration: 'The variable can be trapped between two bounds, which becomes one interval.',
        math: '-2<x\\le3\\quad\\Longleftrightarrow\\quad (-2,3]',
        highlight: '(-2,3]',
      },
      {
        title: 'Checkpoint: write interval notation',
        narration: 'Match each endpoint to its inclusion symbol.',
        math: '2<x\\le8',
        checkpoint: {
          prompt: 'Enter the interval.',
          answer: '(2,8]',
          hint: 'Use a parenthesis at 2 and a bracket at 8.',
        },
      },
    ],
  },
  'domain-range': {
    slug: 'domain-range',
    title: 'Domain and Range',
    focus: 'Domain and range keep inputs legal and outputs meaningful, which matters constantly for limits, graphs, and inverse functions.',
    scenes: [
      {
        title: 'Domain means allowed inputs',
        narration: 'The domain is the set of x-values a formula or graph can actually accept.',
        math: 'f(x)=2x+1\\quad\\text{domain: all real numbers}',
        highlight: 'x',
      },
      {
        title: 'Denominators cannot be zero',
        narration: 'For rational functions, remove any input that makes a denominator zero.',
        math: 'f(x)=\\frac{1}{x-4}\\quad x\\ne4',
        highlight: 'x\\ne4',
      },
      {
        title: 'Checkpoint: exclude a denominator zero',
        narration: 'Set the denominator equal to zero to find the blocked input.',
        math: 'g(x)=\\frac{3}{x+2}',
        checkpoint: {
          prompt: 'What x-value is excluded?',
          answer: '-2',
          hint: 'Solve x + 2 = 0.',
        },
      },
      {
        title: 'Square roots need nonnegative radicands',
        narration: 'For real-valued square roots, the expression under the radical must be at least zero.',
        math: 'h(x)=\\sqrt{x-5}\\quad x-5\\ge0\\Rightarrow x\\ge5',
        highlight: 'x\\ge5',
      },
      {
        title: 'Range means possible outputs',
        narration: 'A parabola with a lowest point has outputs starting at that minimum.',
        math: 'p(x)=(x-2)^2-3\\quad\\text{range: }y\\ge-3',
        highlight: 'y\\ge-3',
      },
      {
        title: 'Checkpoint: range from a vertex',
        narration: 'The squared term is never negative, so the vertex gives the minimum output.',
        math: 'q(x)=(x+1)^2+4',
        checkpoint: {
          prompt: 'Enter the range.',
          answer: 'y>=4|[4,infinity)',
          hint: 'The smallest value is 4, and outputs go upward from there.',
        },
      },
    ],
  },
  'composition-inverses': {
    slug: 'composition-inverses',
    title: 'Composition and Inverses',
    focus: 'Composition and inverses prepare you for chained functions, inverse trig/log ideas, and interpreting one process undoing another.',
    scenes: [
      {
        title: 'Composition is inside-out',
        narration: 'For f(g(x)), evaluate g first, then feed that output into f.',
        math: 'f(x)=2x+1,\\quad g(x)=x^2,\\quad f(g(3))=f(9)',
        highlight: 'g(3)=9',
      },
      {
        title: 'Finish the outside function',
        narration: 'Now use the result from the inside function as the input to the outside function.',
        math: 'f(9)=2(9)+1=19',
        highlight: '19',
      },
      {
        title: 'Checkpoint: compose two functions',
        narration: 'Work from the parentheses outward.',
        math: 'f(x)=x-4,\\quad g(x)=3x,\\quad f(g(2))=?',
        checkpoint: {
          prompt: 'What is f(g(2))?',
          answer: '2',
          hint: 'g(2) = 6, then f(6) = 6 - 4.',
        },
      },
      {
        title: 'Inverses undo each other',
        narration: 'An inverse reverses the original function, turning outputs back into inputs.',
        math: 'f(x)=2x-5\\quad\\Rightarrow\\quad f^{-1}(y)=\\frac{y+5}{2}',
        highlight: 'f^{-1}',
      },
      {
        title: 'Swap and solve',
        narration: 'To find an inverse, write y, swap x and y, then solve for y.',
        math: 'y=2x-5\\Rightarrow x=2y-5\\Rightarrow y=\\frac{x+5}{2}',
        highlight: '\\frac{x+5}{2}',
      },
      {
        title: 'Checkpoint: inverse evaluation',
        narration: 'Ask what input would have produced the given output.',
        math: 'f(x)=2x-5,\\quad f^{-1}(7)=?',
        checkpoint: {
          prompt: 'What is f inverse of 7?',
          answer: '6',
          hint: 'Solve 2x - 5 = 7.',
        },
      },
    ],
  },
  'piecewise-transformations': {
    slug: 'piecewise-transformations',
    title: 'Piecewise Functions and Transformations',
    focus: 'Piecewise rules, shifts, and stretches are essential for reading graphs and understanding functions before limits.',
    scenes: [
      {
        title: 'Choose the branch first',
        narration: 'A piecewise function gives different formulas for different input regions.',
        math: 'f(x)=\\begin{cases}x+2,&x<1\\\\3x,&x\\ge1\\end{cases}',
        highlight: 'x\\ge1',
      },
      {
        title: 'Use the inequality tied to the input',
        narration: 'At x = 1, the second branch applies because it includes the endpoint.',
        math: 'f(1)=3(1)=3',
        highlight: '3',
      },
      {
        title: 'Checkpoint: evaluate a piecewise function',
        narration: 'Pick the formula whose condition matches the input.',
        math: 'f(x)=\\begin{cases}x^2,&x<0\\\\x+5,&x\\ge0\\end{cases},\\quad f(0)=?',
        checkpoint: {
          prompt: 'What is f(0)?',
          answer: '5',
          hint: 'Use the x >= 0 branch.',
        },
      },
      {
        title: 'Vertical shifts are direct',
        narration: 'Adding outside the function moves the graph up. Subtracting outside moves it down.',
        math: 'g(x)=f(x)+2\\quad\\text{moves up 2}',
        highlight: '+2',
      },
      {
        title: 'Horizontal shifts feel opposite',
        narration: 'Replacing x with x - 3 moves the graph right 3 because the same output now happens later.',
        math: 'g(x)=f(x-3)\\quad\\text{moves right 3}',
        highlight: 'x-3',
      },
      {
        title: 'Checkpoint: describe a transformation',
        narration: 'Read inside changes horizontally and outside changes vertically.',
        math: 'g(x)=f(x-3)+2',
        checkpoint: {
          prompt: 'Enter the shifts.',
          answer: 'right3,up2|right 3, up 2|up2,right3|up 2, right 3',
          hint: 'x - 3 moves right 3. +2 moves up 2.',
        },
      },
    ],
  },
  'unit-circle-radians': {
    slug: 'unit-circle-radians',
    title: 'Unit Circle and Radians',
    focus: 'Calc I uses radians by default, and the unit circle gives exact trig values without reaching for a calculator.',
    scenes: [
      {
        title: 'Radians measure arc length',
        narration: 'One full turn is 2 pi radians, which matches the circumference of the unit circle.',
        math: '360^\\circ=2\\pi\\text{ radians}',
        highlight: '2\\pi',
      },
      {
        title: 'Convert degrees to radians',
        narration: 'Multiply degrees by pi over 180 and reduce the fraction.',
        math: '60^\\circ\\cdot\\frac{\\pi}{180^\\circ}=\\frac{\\pi}{3}',
        highlight: '\\frac{\\pi}{3}',
      },
      {
        title: 'Checkpoint: convert to radians',
        narration: 'A straight angle is half of a full turn.',
        math: '180^\\circ=?',
        checkpoint: {
          prompt: 'Enter the radian measure.',
          answer: 'pi|\\pi',
          hint: '180 degrees is pi radians.',
        },
      },
      {
        title: 'Coordinates are cosine and sine',
        narration: 'On the unit circle, the x-coordinate is cosine and the y-coordinate is sine.',
        math: '(x,y)=(\\cos\\theta,\\sin\\theta)',
        highlight: '(\\cos\\theta,\\sin\\theta)',
      },
      {
        title: 'Memorize the anchor angles',
        narration: 'The common angles pi/6, pi/4, and pi/3 come from 30-60-90 and 45-45-90 triangles.',
        math: '\\sin\\left(\\frac{\\pi}{6}\\right)=\\frac{1}{2},\\quad \\cos\\left(\\frac{\\pi}{3}\\right)=\\frac{1}{2}',
        highlight: '\\frac{1}{2}',
      },
      {
        title: 'Checkpoint: exact unit-circle value',
        narration: 'Use the 30-degree anchor angle.',
        math: '\\sin\\left(\\frac{\\pi}{6}\\right)=?',
        checkpoint: {
          prompt: 'What is the exact value?',
          answer: '1/2',
          hint: 'pi/6 is 30 degrees, where sine is 1/2.',
        },
      },
    ],
  },
  'trig-identities': {
    slug: 'trig-identities',
    title: 'Trig Identities',
    focus: 'Core identities let you simplify trig expressions before differentiating, integrating later, or solving trig equations.',
    scenes: [
      {
        title: 'Start with the Pythagorean identity',
        narration: 'The unit circle equation x squared plus y squared equals one becomes the most-used trig identity.',
        math: '\\sin^2\\theta+\\cos^2\\theta=1',
        highlight: '1',
      },
      {
        title: 'Solve for the missing ratio',
        narration: 'If sine is known and the quadrant is known, the identity can find cosine.',
        math: '\\sin\\theta=\\frac{3}{5}\\Rightarrow \\cos^2\\theta=1-\\frac{9}{25}=\\frac{16}{25}',
        highlight: '\\frac{16}{25}',
      },
      {
        title: 'Checkpoint: find cosine in quadrant I',
        narration: 'In quadrant I, cosine is positive.',
        math: '\\sin\\theta=\\frac{3}{5}',
        checkpoint: {
          prompt: 'What is cos(theta)?',
          answer: '4/5',
          hint: 'cos squared is 16/25, so cosine is positive 4/5.',
        },
      },
      {
        title: 'Tangent is sine over cosine',
        narration: 'Quotient identities rewrite tangent and cotangent using sine and cosine.',
        math: '\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}',
        highlight: '\\frac{\\sin\\theta}{\\cos\\theta}',
      },
      {
        title: 'Use identities to simplify',
        narration: 'Replace 1 minus sine squared with cosine squared, then cancel one cosine factor.',
        math: '\\frac{1-\\sin^2 x}{\\cos x}=\\frac{\\cos^2 x}{\\cos x}=\\cos x',
        highlight: '\\cos x',
      },
      {
        title: 'Checkpoint: simplify with an identity',
        narration: 'Use sin squared plus cos squared equals one.',
        math: '\\frac{1-\\sin^2 x}{\\cos x}=?',
        checkpoint: {
          prompt: 'Enter the simplified expression.',
          answer: 'cosx|cos(x)|\\cos x',
          hint: '1 - sin^2 x equals cos^2 x.',
        },
      },
    ],
  },
  'quadratic-solving': {
    slug: 'quadratic-solving',
    title: 'Quadratic Solving',
    focus: 'Quadratics appear in graph interpretation, optimization setup, motion formulas, and algebra that Calc I assumes you can handle.',
    scenes: [
      {
        title: 'Set the quadratic equal to zero',
        narration: 'Solving a quadratic means finding the input values that make the output zero.',
        math: 'x^2-5x+6=0',
        highlight: '=0',
      },
      {
        title: 'Factor when possible',
        narration: 'Find two numbers that multiply to the constant and add to the middle coefficient.',
        math: 'x^2-5x+6=(x-2)(x-3)',
        highlight: '2,3',
      },
      {
        title: 'Checkpoint: zero product property',
        narration: 'If a product is zero, at least one factor must be zero.',
        math: '(x-2)(x-3)=0',
        checkpoint: {
          prompt: 'Enter both solutions.',
          answer: '2,3|3,2',
          hint: 'Set x - 2 = 0 and x - 3 = 0.',
        },
      },
      {
        title: 'Use the formula when factoring is hard',
        narration: 'The quadratic formula solves every quadratic equation, including ones that do not factor cleanly.',
        math: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
        highlight: 'b^2-4ac',
      },
      {
        title: 'Read the discriminant',
        narration: 'The expression under the radical tells whether there are two, one, or no real solutions.',
        math: 'b^2-4ac>0\\Rightarrow\\text{two real solutions}',
        highlight: '>0',
      },
      {
        title: 'Checkpoint: discriminant',
        narration: 'Identify a, b, and c from ax squared plus bx plus c.',
        math: 'x^2+2x+5=0',
        checkpoint: {
          prompt: 'What is b^2 - 4ac?',
          answer: '-16',
          hint: 'b = 2, a = 1, c = 5.',
        },
      },
    ],
  },
  'polynomial-rational-graphs': {
    slug: 'polynomial-rational-graphs',
    title: 'Polynomial and Rational Graphs',
    focus: 'Zeros, end behavior, and asymptotes are graph-reading skills Calc I uses before limits and derivatives.',
    scenes: [
      {
        title: 'Zeros come from factors',
        narration: 'A factored polynomial shows where the graph crosses or touches the x-axis.',
        math: 'f(x)=(x+2)(x-3)\\Rightarrow x=-2,3',
        highlight: '-2,3',
      },
      {
        title: 'End behavior comes from the leading term',
        narration: 'The highest power controls what the graph does far to the left and right.',
        math: 'f(x)=2x^4-3x+1\\quad\\text{both ends up}',
        highlight: '2x^4',
      },
      {
        title: 'Checkpoint: polynomial zeros',
        narration: 'Set each factor equal to zero.',
        math: 'f(x)=(x-4)(x+1)',
        checkpoint: {
          prompt: 'Enter the x-intercepts.',
          answer: '4,-1|-1,4',
          hint: 'Solve x - 4 = 0 and x + 1 = 0.',
        },
      },
      {
        title: 'Vertical asymptotes come from denominator zeros',
        narration: 'A rational function usually has a vertical asymptote where the denominator becomes zero.',
        math: 'f(x)=\\frac{1}{x-5}\\Rightarrow x=5',
        highlight: 'x=5',
      },
      {
        title: 'Horizontal asymptotes compare leading terms',
        narration: 'For equal degrees, divide the leading coefficients.',
        math: 'f(x)=\\frac{3x+1}{2x-4}\\Rightarrow y=\\frac{3}{2}',
        highlight: 'y=\\frac{3}{2}',
      },
      {
        title: 'Checkpoint: rational asymptote',
        narration: 'Set the denominator equal to zero.',
        math: 'f(x)=\\frac{2}{x+7}',
        checkpoint: {
          prompt: 'What is the vertical asymptote?',
          answer: 'x=-7|-7',
          hint: 'Solve x + 7 = 0.',
        },
      },
    ],
  },
  'trig-graphs': {
    slug: 'trig-graphs',
    title: 'Trig Graphs',
    focus: 'Trig graphs help you recognize periodic behavior, amplitude, period, and midline before calculus uses trig functions heavily.',
    scenes: [
      {
        title: 'Amplitude is height from the midline',
        narration: 'The coefficient in front of sine or cosine tells how far the graph rises and falls from its center.',
        math: 'y=3\\sin x\\quad\\text{amplitude }3',
        highlight: '3',
      },
      {
        title: 'Period is cycle length',
        narration: 'Sine and cosine repeat every 2 pi before transformations.',
        math: '\\sin(x+2\\pi)=\\sin x',
        highlight: '2\\pi',
      },
      {
        title: 'Checkpoint: amplitude',
        narration: 'Use the absolute value of the outside coefficient.',
        math: 'y=-4\\cos x',
        checkpoint: {
          prompt: 'What is the amplitude?',
          answer: '4',
          hint: 'Amplitude is always nonnegative.',
        },
      },
      {
        title: 'B changes the period',
        narration: 'In y = sin(Bx), a larger B compresses the graph horizontally.',
        math: 'y=\\sin(2x)\\quad\\text{period }\\frac{2\\pi}{2}=\\pi',
        highlight: '\\pi',
      },
      {
        title: 'Vertical shifts set the midline',
        narration: 'Adding outside sine or cosine moves the center line up or down.',
        math: 'y=\\cos x-3\\quad\\text{midline }y=-3',
        highlight: 'y=-3',
      },
      {
        title: 'Checkpoint: period',
        narration: 'Use 2 pi divided by the coefficient on x.',
        math: 'y=\\sin(4x)',
        checkpoint: {
          prompt: 'What is the period?',
          answer: 'pi/2|\\pi/2',
          hint: '2 pi divided by 4 is pi over 2.',
        },
      },
    ],
  },
  'inverse-trig-basics': {
    slug: 'inverse-trig-basics',
    title: 'Inverse Trig Basics',
    focus: 'Inverse trig appears in Calc I applications and later integration, so you need to know what angle a trig value points back to.',
    scenes: [
      {
        title: 'Inverse trig asks for an angle',
        narration: 'Arcsin, arccos, and arctan reverse a trig ratio back to a principal angle.',
        math: '\\arcsin\\left(\\frac{1}{2}\\right)=?',
        highlight: '\\arcsin',
      },
      {
        title: 'Use unit-circle values',
        narration: 'Sine equals one-half at pi over 6 in the principal arcsin range.',
        math: '\\sin\\left(\\frac{\\pi}{6}\\right)=\\frac{1}{2}\\Rightarrow \\arcsin\\left(\\frac{1}{2}\\right)=\\frac{\\pi}{6}',
        highlight: '\\frac{\\pi}{6}',
      },
      {
        title: 'Checkpoint: inverse sine',
        narration: 'Ask which principal angle has sine equal to one-half.',
        math: '\\arcsin\\left(\\frac{1}{2}\\right)=?',
        checkpoint: {
          prompt: 'Enter the angle in radians.',
          answer: 'pi/6|\\pi/6',
          hint: 'Sine of pi over 6 is one-half.',
        },
      },
      {
        title: 'Arccos has a different range',
        narration: 'Arccos returns angles from 0 to pi, so the principal answer is chosen from that interval.',
        math: '\\arccos\\left(\\frac{1}{2}\\right)=\\frac{\\pi}{3}',
        highlight: '[0,\\pi]',
      },
      {
        title: 'Arctan tracks slope',
        narration: 'Tangent is rise over run, so arctan often turns a slope or ratio back into an angle.',
        math: '\\arctan(1)=\\frac{\\pi}{4}',
        highlight: '\\frac{\\pi}{4}',
      },
      {
        title: 'Checkpoint: inverse tangent',
        narration: 'Use the 45-degree reference angle.',
        math: '\\arctan(1)=?',
        checkpoint: {
          prompt: 'Enter the angle in radians.',
          answer: 'pi/4|\\pi/4',
          hint: 'Tangent of pi over 4 is 1.',
        },
      },
    ],
  },
};
