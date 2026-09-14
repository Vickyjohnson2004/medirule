# MediRule — Rule-Based Health Advisory & Symptom Analysis System

**Final-year Computer Science project:** Design and Implementation of a Rule-Based Health Advisory and Symptom Analysis System.

MediRule is a full-stack Next.js application that demonstrates an explainable expert-system architecture. It accepts user-reported symptoms, resolves known concepts, stores unrecognized symptoms for human review, screens red flags, evaluates weighted knowledge-base rules, classifies application risk, and produces general health advisories.

> **Safety:** MediRule is not a diagnostic service. It never presents rule-match scores as medical probabilities, does not prescribe medication, and does not replace a qualified healthcare professional. Emergency warning signs should be handled by urgent professional/emergency care.

## Stack

- Next.js 16.3.5 / App Router / TypeScript
- React 19.3
- Tailwind CSS 4.3
- MongoDB + Mongoose 9
- Zod 4 + React Hook Form
- Framer Motion
- Recharts
- Lucide React
- bcryptjs + jose JWTs
- PDFKit
- Vitest

Next.js 16.x is an Active LTS release as of September 2026; this project uses the latest stable Next.js release available when generated. The package versions intentionally avoid canary releases.

## Features

### Patient

- Registration and login with bcrypt password hashing.
- JWT access/refresh cookies marked HTTP-only; tokens are never stored in localStorage.
- Multi-step assessment wizard.
- Searchable symptom knowledge base and custom symptom capture.
- Severity, duration and onset details.
- Red-flag screening.
- Weighted rule matching with explainable evidence.
- Risk levels: LOW, MODERATE, HIGH, EMERGENCY.
- Explicit no-match and insufficient-information handling.
- Assessment history and deletion.
- PDF report generation.

### Professional

The role exists in the authorization model and can access authorized assessment review endpoints. Production deployments should add verified professional onboarding before presenting a person as a clinician.

### Administrator

- Analytics dashboard.
- Active rule inventory.
- Unknown symptom review queue.
- Rule knowledge-base management endpoint.
- Versioned rule records.

## Architecture

```text
Browser
  ↓
Next.js UI / Server Components / Route Handlers
  ↓
Authentication + Authorization + Zod Validation
  ↓
Assessment Service
  ↓
Symptom Resolver → UnknownSymptom queue
  ↓
Red-Flag Engine
  ↓
Rule Engine → Weighted Rule Scoring
  ↓
Risk Engine
  ↓
Advisory Engine
  ↓
MongoDB / Mongoose
```

The red-flag engine is evaluated independently and has priority over ordinary pattern matching.

## Folder structure

```text
app/
  api/
  (auth)/
  assessment/
  admin/
  dashboard/
  history/
  results/[id]/
components/
lib/
models/
services/
validators/
types/
scripts/
tests/
public/
```

## Requirements

- Node.js version supported by the current Next.js release.
- MongoDB running locally or a MongoDB connection string.
- No Docker is required.

## Installation

```bash
npm install
```

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set at least:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/medirule
JWT_ACCESS_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_REFRESH_SECRET=replace-with-another-long-random-secret-at-least-32-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-me-before-running-seed
```

## Seed development knowledge

The seed is intentionally **demonstration/development knowledge**. It provides a small rule base for showing the expert-system mechanics and should be clinically reviewed before any real-world use.

```bash
npm run seed
```

The seed creates sample symptoms, non-diagnostic symptom patterns, red-flag rules, advisories, follow-up questions and an administrator account from environment variables.

The seed does **not** run automatically during application startup.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Authentication

Authentication uses signed JWTs in secure HTTP-only cookies. The access token is short-lived and the refresh token is longer-lived. Cookies use `secure` in production and `sameSite=lax` by default for same-site application deployments.

Do not move tokens to localStorage. For cross-site production deployments, explicitly configure the deployment architecture and cookie policy rather than weakening cookie security.

## Rule scoring

A rule contains weighted symptoms and a minimum score. Example:

```text
Fever = 30
Chills = 20
Headache = 15
Minimum = 60
```

A user with all three receives a **rule match score of 65**. This is an explainability mechanism, **not** a probability of having a disease.

Historical assessment results preserve rule IDs, versions, matched symptoms, missing symptoms, score and explanation.

## Unknown symptoms

Custom text is not automatically treated as a known medical concept. When the application cannot confidently classify it, the text is stored in `UnknownSymptom` with a pending status. Administrators can review the queue before adding or merging knowledge-base concepts.

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/symptoms`
- `POST /api/assessments`
- `GET /api/assessments`
- `GET /api/assessments/:id`
- `DELETE /api/assessments/:id`
- `POST /api/assessments/:id/analyze`
- `GET /api/reports/:id`
- `GET /api/admin/analytics`
- `GET/PATCH /api/admin/unknown-symptoms`
- `GET/POST /api/admin/rules`

## Security notes

- Passwords are hashed with bcrypt.
- JWTs are stored only in HTTP-only cookies.
- Zod validates authentication and assessment payloads.
- Patient assessment ownership is checked server-side.
- Role authorization is enforced in protected APIs.
- Password hashes are excluded from normal user queries.
- Server errors return generic production-safe messages.
- Health data should not be written to logs.

For a real deployment, add a reverse proxy/WAF, centralized rate limiting, CSRF strategy appropriate to the final cookie architecture, encrypted backups, key rotation, monitoring, secure headers/CSP review, formal privacy/retention policies, and clinical review of every knowledge-base rule.

## Privacy

This project is designed as an academic demonstration. Do not collect real patient data until your deployment has an appropriate legal, privacy, security and clinical governance review. The UI provides account-level assessment deletion, and the backend checks ownership before returning patient assessments.

## Limitations

- The included knowledge base is intentionally small.
- Demonstration rules are not a clinical diagnostic protocol.
- Professional verification/onboarding is not implemented as a real credentialing service.
- Password reset structure is reserved for the next security module; production deployments should add expiring, one-time reset tokens delivered through a verified channel.
- Production clinical use would require domain-expert validation, governance, audit, monitoring and applicable regulatory/privacy controls.

SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=your-development-password

npm run seed
npm run dev

npm install
npm run lint
npm test
npm run build
# medirule
