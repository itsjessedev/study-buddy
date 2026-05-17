# Study Buddy Agent Instructions

These instructions are repo-local and apply in addition to Jesse's global Codex rules.

## Product Scope

Study Buddy is a math refresher for someone preparing to take Calculus I in college.

- Build toward Calc I readiness, not a full K-12 curriculum.
- Do not include Calculus I as a course; Calculus I is the class this app prepares for.
- The intended course scope is:
  - Fractions
  - Solving equations
  - Exponent rules
  - Factoring
  - Function notation
  - Graphs and slope
  - Radicals
  - Logs/exponentials
  - Basic trig
- Prefer lesson-first workflows: teach the topic with worked examples and guided practice, then quiz over that lesson.
- Keep quiz-only mode available for extra practice.

## Repo Surfaces

- `api/`: FastAPI backend, SQLAlchemy models, adaptive learning, question generators.
- `web/`: React + TypeScript + Vite frontend.
- `mobile/`: React Native/Expo app exists, but verify whether it is still in active scope before changing it.
- `content/`: skill catalog and explainers used by seeding/content workflows.

## Local Commands

Backend:

```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --reload --port 8001
```

Web:

```bash
cd web
npm install
npm run lint
npm run build
npm run dev
```

Notes:

- `web/package.json` currently has `lint`, `build`, `dev`, and `preview`.
- There is no committed backend test suite at the time this file was written. If making backend logic changes, add focused tests or record a specific manual verification checklist.
- Do not commit `.env`, `api/study_buddy.db`, generated `venv/`, `node_modules/`, or build artifacts unless explicitly requested.

## Live Production Reality

Inspected on 2026-05-17 via SSH alias `junipr-vps`.

Public URLs:

- Web: `https://study.junipr.io`
- API route configured in Caddy: `https://study.junipr.io/study/*`

Important findings:

- `https://api.junipr.io/study/*` is not the Study Buddy FastAPI API. It returned a 404 from the Junipr API platform during inspection.
- Caddy routes `study.junipr.io` like this:
  - `/study/*` -> `127.0.0.1:8001`
  - everything else -> `/srv/study-buddy/web/dist`
- The frontend production bundle was built with API base `https://study.junipr.io/study`.
- `study-buddy-api.service` exists at `/etc/systemd/system/study-buddy-api.service`, but was inactive during inspection.
- Because the API service was inactive, `https://study.junipr.io/study/skills` returned `502`.
- The visible frontend still loads and redirects to `/login`.

VPS paths:

- Git checkout: `/home/deploy/study-buddy`
- Served copy: `/srv/study-buddy`
- Served web dist: `/srv/study-buddy/web/dist`
- Served API working directory: `/srv/study-buddy/api`
- Caddy config: `/etc/caddy/Caddyfile`
- Systemd unit: `/etc/systemd/system/study-buddy-api.service`

Deployment state caveats:

- `/home/deploy/study-buddy` is a Git checkout on `main`, remote `https://github.com/junipr-dev/study-buddy.git`.
- Local dev repo remote may differ; confirm remotes before pushing or deploying.
- `/srv/study-buddy` is a copied served tree, not the same path as the Git checkout.
- During inspection, `/srv/study-buddy/api/app/routes/admin.py` and `/srv/study-buddy/api/app/schemas.py` differed from the VPS Git checkout.
- The production DB had 49 skills and 149 question templates during inspection, so old broad-curriculum data may remain even after catalog changes unless filtered or migrated.

Useful read-only production checks:

```bash
ssh junipr-vps 'systemctl status study-buddy-api --no-pager'
ssh junipr-vps 'sudo -n journalctl -u study-buddy-api --no-pager -n 120'
ssh junipr-vps 'sudo -n sed -n "1,220p" /etc/systemd/system/study-buddy-api.service'
ssh junipr-vps 'sudo -n sed -n "1,320p" /etc/caddy/Caddyfile'
ssh junipr-vps 'ss -ltnp'
curl -I https://study.junipr.io
curl -sS https://study.junipr.io/study/health
```

Never print production secret values. If environment inspection is needed, print key names or redact values.

## Implementation Guidance

- `content/skills.json` is the source catalog for seeded skills, but existing DB rows can outlive catalog edits.
- If a course is removed from the product scope, also ensure adaptive selection, skill listing, evaluation, and targeted practice cannot surface stale DB skills.
- Question generators live in `api/app/generators/`; register new generators in `api/app/generators/__init__.py`.
- API prefix comes from `Settings.api_prefix`, defaulting to `/study`.
- Web API calls go through `web/src/api/client.ts`.
- The main learner UI is currently `web/src/pages/Quiz.tsx`; avoid preserving old mode names if the product moves to Learn vs Quiz Only.
- Keep UI text practical and learner-focused. This app is a study tool, not a marketing site.

## Verification Expectations

For product changes:

- Run `npm run lint` and `npm run build` in `web/`.
- Run backend import/generator checks at minimum if no backend test suite exists.
- For UI changes, use browser verification and save screenshots under `output/playwright/`.
- Check both desktop and mobile widths when layout changes.
- For deployment-sensitive changes, verify the real production route shape: `/study/*` under `study.junipr.io`.

## Screenshot Convention

If Jesse says "check the screenshot", first look for:

```text
/mnt/c/Users/jesse/Desktop/1.png
```

If that path is unavailable from `dev-lab`, use the saved `desktop-ubuntu` or `desktop` SSH hosts per Jesse's global rules.
