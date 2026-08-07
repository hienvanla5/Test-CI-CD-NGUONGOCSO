# AGENTS.md

"Người gốc số" — agricultural traceability platform. Monorepo: Spring Boot backend + React frontend.

## Layout

- `backend/` — Spring Boot **3.5.16**, **Java 21**, Maven wrapper (`backend/mvnw.cmd`). Package root `vn.nguongocso`. No root pom; `backend/pom.xml` is the only Maven module. All controllers map under `/api/v1/...`.
- `frontend/` — React 19 + Vite 8 + TypeScript, Ant Design 6, Tailwind 4, shadcn. Own `package.json`.
- `docs/` — API docs per feature (`docs/api/...`) and the **mandatory** UI design system: `docs/AI_DESIGN_SYSTEM.md`. Read it before touching any UI.

## Dev commands

Backend (from `backend/`):
- `.\mvnw.cmd spring-boot:run` — run on :8080
- `.\mvnw.cmd test` — all tests
- `.\mvnw.cmd test -Dtest=ClassName` — single test class (Most are Mockito unit tests)

Frontend (from `frontend/`):
- `npm run dev` — Vite dev server (default :5173; CORS only allows localhost:5173/3000 etc. in `SecurityConfig`)
- `npm run lint` — ESLint (NOTE: repo currently has NO eslint.config file, so lint fails as-is)
- `npm run build` — `tsc -b && vite build`; this is the typecheck. No separate typecheck/test scripts exist.

## Config & DB gotchas

- Env is loaded from `backend/.env` via `spring-dotenv` (DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD, defaults in `application.properties`). `backend/.env` is a valid tracked config file — but do not add secrets there.
- **Schema is NOT managed by Flyway.** `application.properties` sets `spring.jpa.hibernate.ddl-auto=update` and `spring.flyway.enabled=false`. Migrations in `src/main/resources/db/migration/V1–V20` are disabled seed/data SQL. To change schema, edit the JPA entities and let Hibernate update; **do not add new Flyway migrations**.
- A live MySQL database (`nguon_goc_so`) is needed to run the app. Only `BackendApplicationTests` is `@SpringBootTest` and requires that DB; Testcontainers is declared in `pom.xml` but unused.
- System-level paths are hardcoded for Windows MySQL (backup `mysqldump`/`mysql` paths in `application.properties`).

## Plan mode workflow

When working in plan mode, follow these steps in order:

- **Step 1:** Receive the user's request, analyze it, and ask the user to confirm it matches their actual needs. This avoids going off track and wasting time and tokens.
- **Step 2:** After getting the user's confirmation, propose options with clear strengths and weaknesses. For each option, state its pros and cons explicitly so the user can decide. Never decide on your own which direction to take — doing so may upset the user.
- **Step 3:** Create a plan following a scientific process, divided into tasks. Each task is one part of the work to be done. Execute tasks one at a time sequentially — never all at once, as that easily causes mistakes and makes it hard for the user to follow along.

## Build mode workflow

When working in build mode:

- Keep tasks as a checklist, with each task defaulting to `false`.
- Do the work strictly according to the tasks. When a task finishes, clearly announce the completed work.
- Only move on to the next step after the user confirms and reviews the current one; then mark that task as `true`.

## Conventions

- Services use `XService` interface + `XServiceImpl` in `service/impl`.
- Security: JWT (`app.jwt.secret` in `application.properties`). Only `/api/v1/auth/login`, `/api/v1/public/**`, `/actuator/health`, `/files/qr/**` are public; everything else needs a Bearer token. Method-level auth via `@EnableMethodSecurity`.
- API responses use `vn.nguongocso.common.ApiResult` and paged lists use `vn.nguongocso.common.PageResponse`.
- Frontend uses path alias `@` → `src` (vite + tsconfig). API base is `VITE_API_BASE_URL=http://localhost:8080/api/v1` in `frontend/.env`.
- No CI, pre-commit hooks, formatter, or checkstyle config exists — follow the style of adjacent files. Commit messages are `feat:`/`fix:` prefixed, Vietnamese descriptions.
- **Commit/push policy:** only commit/push edited source code files and valid config files (e.g. `backend/.env`). NEVER commit `AGENTS.md`, bug-report documents (`docs/*`), or other peripheral files unless the user explicitly asks — the user shares those files with team members themselves.
