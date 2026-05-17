# Study Buddy

A focused Calc I readiness refresher for rebuilding the Algebra I/II and
precalculus skills needed before starting college Calculus I. Calculus itself is
intentionally out of scope.

## Features

- **Interactive Lessons**: Guided, code-rendered math tutorials with checkpoints
- **Lesson Quizzes**: Each lesson hands off into a targeted quiz for that topic
- **Quiz Only Mode**: Extra generated practice for specific refresher topics or mixed review
- **Flexible Answer Validation**: Equivalent fractions, decimals, radicals, powers, algebraic forms, and reordered lists are accepted unless a question requires a specific format
- **Adaptive Learning**: Spaced repetition + difficulty scaling based on performance
- **Smart Gap Detection**: Identifies prerequisite weaknesses when struggling with advanced topics
- **Unlimited Questions**: Programmatic template-based generation (no AI API costs)
- **Google/Cloudflare Access Login**: No public registration; approved Google accounts map to the same local user
- **Progress Tracking**: Detailed mastery scores and analytics

## Course Scope

The active readiness path is:

Fractions, Solving Equations, Exponent Rules, Factoring, Quadratic Solving,
Rational Expressions, Inequalities and Intervals, Function Notation, Domain and
Range, Graphs and Slope, Composition and Inverses, Piecewise and
Transformations, Polynomial and Rational Graphs, Radicals, Logs and
Exponentials, Basic Trig, Unit Circle and Radians, Trig Identities, Trig Graphs,
and Inverse Trig Basics.

## Architecture

- **Web**: React 18 + TypeScript + Vite + Tailwind CSS
- **Mobile**: React Native + TypeScript (Android)
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Equation Rendering**: KaTeX
- **Deployment**: study.junipr.io (VPS)

## Project Structure

```
study-buddy/
├── api/                # FastAPI backend
├── web/                # React web app
├── mobile/             # React Native Android app
├── content/            # Pre-written explainers + Khan Academy links
├── docs/               # Documentation
└── README.md
```

## Development

See individual README files in each directory for setup instructions.

## Deployment

- **Web**: https://study.junipr.io
- **API route**: https://study.junipr.io/study

## License

Personal project for college prep.
