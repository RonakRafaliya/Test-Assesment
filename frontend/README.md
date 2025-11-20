# Frontend Application

This React + TypeScript app is the candidate-facing UI for the full‑stack assessment. It demonstrates:

- Auth flows (login/register) tied to the backend JWT API
- Protected routes with role-aware navigation and task management tools
- Responsive dashboard with an auto-rotating carousel that flips to reveal backside content
- Task CRUD screens implemented with React Query
- File upload widget wired to the backend upload endpoint

## Getting Started

```bash
npm install
npm run dev
```

The app expects a backend running on `http://localhost:4000`. Update the API base URL by copying `env.example` to `.env` and tweaking `VITE_API_URL` if needed.

```bash
cp env.example .env
```

## Key Paths

- `src/pages` – top-level routes (auth, dashboard, tasks)
- `src/components` – reusable UI primitives (carousel, layout, task list/form)
- `src/api` – axios client + API helpers
- `src/hooks` – authentication context provider
- `src/types` – shared TypeScript models

Feel free to extend the scaffolding with charts, notifications, drag & drop, or richer RBAC checks as part of the challenge.***
