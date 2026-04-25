# Kpoikpoimingi Admin Dashboard

Internal React + TypeScript admin dashboard for **Kpoikpoimingi Investment Limited**, a Nigerian asset financing company managing hire purchase contracts across Abuja HQ, Lagos, and Port Harcourt.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query (React Query)
- Recharts
- Mock data only (no backend)

## Features

- Dashboard overview with key metrics, charts, recent activity, and branch performance
- Contracts list with search + status/branch/date filters
- Contract detail with payment schedule, progress tracking, record payment modal, receipt generation, and risk actions
- Payments & reconciliation view with expected vs actual collections, variance, branch reconciliation, and CSV export
- Customers list and customer profile pages
- Role switcher with access rules:
  - `Staff` (Abuja HQ only, no risk actions, no payments page)
  - `Admin` (all branches, risk actions enabled, no payments page)
  - `Super Admin` (full access, payments/reconciliation + recorded by visibility)

## Project Structure

```text
src/
  components/
  pages/
  data/
  hooks/
  types/
  utils/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

### 3. Type-check and build

```bash
npm run typecheck
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Deploy to Vercel

This repo includes a `vercel.json` SPA rewrite config so all routes resolve correctly in production.

Deploy steps:

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Framework preset: `Vite`.
4. Build command: `npm run build`.
5. Output directory: `dist`.

## Notes

- All records are mock in-memory data and reset on page reload.
- No backend, no external APIs, and no persistence layer are used.
