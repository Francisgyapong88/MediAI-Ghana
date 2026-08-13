# MediAI Ghana — Backend

Node.js/Express/TypeScript API for the MediAI Ghana prototype. Enforces
authentication, role-based access control, input validation, symptom-map
and model versioning, and audit logging, per Chapter Three of the project
report. This service is the trust boundary — the frontend makes no
authorization decisions of its own.

## Tech stack

- Node.js, Express, TypeScript
- MySQL 8.0 (via Prisma 7, `prisma-client` generator with the
  `@prisma/adapter-mariadb` driver adapter)
- bcryptjs for password hashing
- Signed, HTTP-only session cookies (no server-side session store)
- express-rate-limit on authentication and prediction endpoints

## Setup

### 1. Install dependencies
npm install
### 2. Configure environment variables

Create a `.env` file in `backend/`:
DATABASE_URL="mysql://root:<your-password>@localhost:3306/medi_ai_ghana"
SESSION_SECRET="<any long random string>"
NODE_ENV=development
PORT=5000
`SESSION_SECRET` signs session cookies — use a long random value, never
commit the real one to Git.

### 3. Database requirements

Requires MySQL 8.0+ or MariaDB 10.5+ (older versions lack `JSON_ARRAYAGG`,
which both Prisma Studio and Prisma's query engine depend on).

Run the migration:
npx prisma migrate dev

### 4. Seed reference and test data

Order matters — later scripts depend on rows created by earlier ones:
npx ts-node --transpile-only src/seed-roles.ts
npx ts-node --transpile-only src/seed-admin.ts
npx ts-node --transpile-only src/seed-evaluator.ts
npx ts-node --transpile-only src/seed-symptoms.ts
npx ts-node --transpile-only src/seed-diseases.ts
npx ts-node --transpile-only src/seed-versions.ts
This creates:
- **Roles & permissions** — `ADMIN`, `EVALUATOR`, `SUPERVISOR_AUDITOR`, each
  with an appropriate permission set
- **Test accounts** (password `ChangeMe123!` for both): `admin` (role
  `ADMIN`), `evaluator` (role `EVALUATOR`) — create a `SUPERVISOR_AUDITOR`
  account via the admin API, or write a similar seed script
- **Enabled symptom vocabulary** — ten supported terms (fever, chills,
  headache, etc.). Six terms are deliberately *not* seeded as enabled per
  Chapter Three §3.6 (Body Weakness, Excessive Thirst, Runny Nose, Joint
  Pain, Sore Throat, Loss of Appetite) — the reported source data doesn't
  provide valid model evidence for them
- **The four in-scope diseases** — malaria, typhoid_fever, pneumonia,
  diabetes_mellitus
- **One active `AiModel`/`SymptomMap` version each** (`v0.1.0-mock`),
  attached to every prediction result

### 5. Start the server
npm run dev

Runs on `http://localhost:5000` by default.

## Database design

Normalized per Chapter Three, Table 3.6 — no JSON blobs for structured
data, no enum-only role field:

| Table | Purpose |
|---|---|
| `roles` / `permissions` / `role_permissions` | Server-enforced permission definitions, not hardcoded in application logic |
| `users` | Accounts; `role_id` FK, password hash only |
| `patients` | Synthetic demonstration patient; `is_synthetic` flag; no real identifiers |
| `patient_visits` | One synthetic encounter linked to a patient |
| `assessments` | Selected vital signs + assessment metadata, linked to a visit |
| `symptoms` / `assessment_symptoms` | Enabled application vocabulary + submitted symptom associations (many-to-many) |
| `diseases` / `disease_symptoms` | The four in-scope labels + their symptom associations |
| `ai_models` | Frozen model version, hash, active status |
| `symptom_maps` | Frozen mapping version, hash, active status |
| `prediction_sessions` | One traceable inference request, including abstention status |
| `prediction_results` | Ranked label + model score per session — **not** a clinical probability |
| `audit_logs` | Append-only protected-action metadata, excluding symptom content and secrets |

## API Reference

All endpoints are prefixed `/api`. All timestamps are UTC. All protected
endpoints require the `mediai_session` cookie, set on successful login.

### Authentication (`/api/auth`)

| Method | Path | Auth | Rate limited | Description |
|---|---|---|---|---|
| POST | `/auth/login` | none | yes (10/15min) | Verifies credentials, sets session cookie |
| POST | `/auth/logout` | required | no | Clears session cookie |
| GET | `/auth/me` | required | no | Returns `{id, role}` for the logged-in user |

`POST /auth/login` response:
```json
{"id": 1, "username": "admin", "role": "ADMIN"}
```

### Assessments (`/api/assessments`)

All routes require authentication. Users only see their own records.

| Method | Path | Description |
|---|---|---|
| POST | `/assessments` | Creates a patient + visit + assessment, links enabled symptoms |
| GET | `/assessments` | Lists the logged-in user's assessments, with nested patient/symptoms/prediction data |
| GET | `/assessments/:id` | Fetches one assessment (404 if not owned by caller) |

**`POST /assessments` request:**
```json
{"age": 34, "sex": "MALE", "symptoms": ["fever", "chills", "headache"], "temperatureC": 38.5}
```
`temperatureC`, `heartRate`, `respiratoryRate` are optional. Any symptom not
in the enabled vocabulary returns `400 UnsupportedSymptom` — unsupported
input is rejected outright, never silently accepted (Chapter Three §3.6).

**Response** is the created `Assessment` with nested `visit.patient` and
`assessmentSymptoms[].symptom`.

### Prediction (`/api/predict`)

| Method | Path | Auth | Rate limited | Description |
|---|---|---|---|---|
| POST | `/predict` | required | yes (20/min) | Creates a `PredictionSession` + `PredictionResult` for an assessment |

Request:
```json
{"assessmentId": 1}
```

Response:
```json
{
  "status": "COMPLETED",
  "modelVersion": "v0.1.0-mock",
  "symptomMapVersion": "v0.1.0-mock",
  "results": [{"label": "malaria", "score": 0.87, "rank": 1}]
}
```

**Currently returns a hardcoded mock score** (`malaria`, `0.87`) — this is
intentional per the Day 4/5 sprint plan. Member 1's real TensorFlow.js model
replaces only the mock-scoring logic in `predict.controller.ts`; the
session/result shape is the contract Member 3 builds against, so it
shouldn't change. If no active `AiModel`/`SymptomMap`/reference disease
data is configured, the endpoint fails closed with `503` rather than
fabricating a result.

### Audit log (`/api/audit-logs`)

| Method | Path | Auth | Description |
|---|---|---|
| GET | `/audit-logs` | `ADMIN` or `SUPERVISOR_AUDITOR` only | Last 100 audit events, newest first |

### Admin (`/api/admin`)

All routes require the `ADMIN` role.

| Method | Path | Description |
|---|---|---|
| GET | `/admin/users` | Lists all accounts, each with nested `role: {name}` |
| POST | `/admin/users` | Creates a new account (`username`, `password`, `role` — role name string, resolved to `roleId` server-side) |
| PATCH | `/admin/users/:id/status` | Sets `ACTIVE` / `INACTIVE` / `LOCKED` |
| PATCH | `/admin/users/:id/role` | Reassigns role by name |

### Disabled feature gate (`/api/blood-pressure`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/blood-pressure` | required (any role) | Always returns `403 FeatureDisabled` |

Permanently disabled per Chapter Three §3.3.3 — blood-pressure
classification/referral logic is out of scope until a qualified clinical
adviser approves a versioned specification. This route exists so security
testing has a real endpoint to attempt bypassing; every attempt is logged
as `DISABLED_FEATURE_BYPASS_ATTEMPT`.

### Health check

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Returns `{"status":"ok"}` — no auth |

## Roles

| Role | Access |
|---|---|
| `EVALUATOR` | Create/view own synthetic assessments; run predictions |
| `ADMIN` | Everything an Evaluator can do, plus account management |
| `SUPERVISOR_AUDITOR` | Read-only access to the audit log; no mutation endpoints |

Role/permission definitions live in the `roles`/`permissions`/
`role_permissions` tables (see `seed-roles.ts`), not hardcoded as an enum —
matching Chapter Three's "server-enforced permission definitions"
requirement. Route-level enforcement still checks the role *name* via
`requireRole(...)` middleware; the permissions table exists as queryable
evidence of what each role is entitled to, for audit/documentation
purposes.

## Security model

- Passwords hashed with bcrypt (12 salt rounds), never stored or logged in
  plaintext.
- Sessions are signed, HMAC-SHA256 cookies (`httpOnly`, `SameSite=strict`,
  `secure` in production), with a 15-minute **sliding inactivity timeout**
  — every authenticated request refreshes the window.
- Every protected route requires `requireAuth`; role-restricted routes add
  `requireRole(...)`. Both log denials to `audit_logs`.
- Rate limiting on `/auth/login` (10 requests / 15 min) and `/predict`
  (20 requests / min).
- Audit log records the acting user, action, resource, outcome, and
  timestamp — **never** symptom content, passwords, or session tokens.
- Failures fail closed: if the active model/symptom-map version or
  reference disease data can't be resolved, `/predict` returns `503`
  rather than fabricating a result.
- Unsupported symptom input is rejected at the API boundary (`400`), never
  silently accepted or passed through to the model.

## Known limitations (documented, not hidden)

Consistent with the three scope reductions already approved by the
project supervisor (manual OWASP checklist instead of an automated scan;
internal team walkthrough instead of an external usability study; basic
accuracy reporting instead of full calibration analysis), the following
are documented as limitations rather than fully implemented:

- **Session revocation is not server-enforced.** Sessions are stateless
  signed cookies with no server-side record, so logout clears the cookie
  client-side but cannot invalidate a copied/captured token before its
  15-minute inactivity window naturally expires. A future iteration would
  add a `sessionVersion` column on `users`, incremented on logout/password
  change and checked on every request.
- **No automated data-retention/deletion jobs.** Chapter Three specifies
  synthetic records deleted within 30 days and audit logs retained 6
  months post-examination; this prototype does not automate either —
  deletion would need to be performed manually or via a scheduled job in
  a future iteration.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (`ts-node-dev`, transpile-only) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Apply migrations |
| `npm run prisma:studio` | Open Prisma Studio (DB browser) |
