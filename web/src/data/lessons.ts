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
};
