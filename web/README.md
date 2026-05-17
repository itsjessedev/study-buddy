# Study Buddy Web App

React + TypeScript web application for the Study Buddy Calc I readiness refresher.

## Features

- **Learn Mode** - Guided math tutorials with checkpoint practice
- **Lesson Quiz Handoff** - Start targeted quiz practice from the end of each lesson
- **Quiz Only Mode** - Extra generated practice by course or mixed review
- **Readiness Check** - Quick scan across the refresher topics
- **Real-time Feedback** - Instant answer validation with step-by-step solutions
- **Progress Tracking** - Detailed mastery scores and weak area analysis
- **Math Rendering** - KaTeX for beautiful equation display
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Router (navigation)
- Zustand (state management)
- TanStack Query (server state)
- Tailwind CSS (styling)
- KaTeX (math rendering)

## Development

### Setup

```bash
cd web
npm install
cp .env.example .env
```

Edit `.env` and set the API URL:
```
VITE_API_BASE_URL=http://localhost:8001/study
```

### Run Development Server

```bash
npm run dev
```

App will be available at: http://localhost:5173

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Project Structure

```
web/
├── src/
│   ├── api/           # API client modules
│   ├── components/    # Reusable React components
│   ├── pages/         # Page components (Login, Quiz, Progress)
│   ├── store/         # Zustand state stores
│   ├── styles/        # Global styles and Tailwind
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Root component with routing
├── public/            # Static assets
└── index.html         # HTML entry point
```

## Available Routes

- `/` - Redirects to `/quiz` (if logged in) or `/login`
- `/login` - Google/Cloudflare Access sign-in entry point
- `/quiz` - Learn, Quiz Only, and Check modes
- `/progress` - Progress dashboard

## Components

### QuestionCard
Displays question with answer input. Supports LaTeX rendering via KaTeX for math content and accepts equivalent answer formats through the API validator.

### FeedbackModal
Shows answer feedback with:
- Correct/incorrect status
- Correct answer
- Step-by-step solution
- Educational explanation

### Progress Dashboard
- Overall statistics
- Mastery breakdown
- Weak areas identification
- Skill-by-skill progress

## State Management

### Auth Store (Zustand)
- User authentication state
- Login/register/logout actions
- Token management

### Quiz Store (Zustand)
- Current question
- Answer feedback
- Loading states
- Question timing

## API Integration

All API calls go through typed client in `src/api/`:
- `auth.ts` - Authentication endpoints
- `questions.ts` - Question fetching and submission
- `progress.ts` - Progress tracking
- `client.ts` - Base HTTP client with auth headers

## Styling

Tailwind CSS with custom theme:
- **Primary:** #661FFF (Electric Indigo)
- **Secondary:** #00FFE0 (Neon Cyan)
- **Background:** #0A0A0A (Jet Black)
- **Surface:** #1A1A1A (Graphite Gray)

Responsive design with mobile-first approach.

## Deployment

See main README for deployment instructions to study.junipr.io.
