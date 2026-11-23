# KS Tirana — Build Plan

Status: approved by client 2026-11-23. Hosting not chosen yet (likely a VPS, e.g. Contabo).
Source photos: `D:\KS Tirana WEB` (read-only — never modified by our scripts).

## Principles

1. **Host-neutral.** Every outside service connects through environment variables and a standard
   protocol (Postgres URL, SMTP, filesystem or S3). Moving from local → Vercel → VPS changes
   settings, never code.
2. **Real database from day one.** Postgres runs locally in Docker. Every table, page and admin form
   is tested against it before any VPS exists.
3. **Photos are files, not database rows.** The database stores metadata (path, size, discipline,
   people). The files live on disk (VPS) or in a bucket.
4. **One app.** The backend (forms, uploads, admin API, login) lives inside the Next.js app.
   No separate server to deploy or keep running.
5. **Correct first, fast second.** Pages read the database on each request at first. Caching is
   added after everything works, using the guide in
   `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`.
6. **Read this Next.js version's docs before each feature** (`node_modules/next/dist/docs/`) — it has
   breaking changes from older versions (e.g. `proxy.ts` instead of `middleware.ts`).

## Stack

| Concern | Choice | Notes |
|---|---|---|
| App | Next.js 16 (existing), `output: "standalone"` for Docker | Runs on Vercel, Node or Docker |
| Database | PostgreSQL 17 (Docker locally, same on VPS) | One `DATABASE_URL` |
| SQL | Plain `.sql` migration files in `db/migrations/` + small runner | The SQL is ours to read and review |
| DB driver | `pg` (node-postgres) | One shared pool in `lib/db/pool.ts`, also used by Better Auth (its Postgres adapter is built on `pg`) |
| Admin login | Better Auth 1.7, users stored in our Postgres | Verified on Next 16.4.5 in Phase 1. Tables generated with `npx auth@<version> generate` into a migration |
| Validation | `zod` | All form and admin input |
| Images | `sharp` → 3 WebP sizes + blur placeholder at import/upload | No dependence on any host's image service |
| Storage | `lib/storage` interface, **local-disk driver** first | S3 driver only if a bucket is ever needed |
| Email | `nodemailer` over SMTP | Works with the club's own mailbox |

## Phase 1 — Local foundation

- `docker-compose.dev.yml` with Postgres 17 and a named volume.
- `.env.example` documenting every variable (`DATABASE_URL`, `STORAGE_DIR`, `MEDIA_BASE_URL`,
  `SMTP_*`, `AUTH_SECRET`, …). `.env` and `storage/` in `.gitignore`.
- Migration runner: applies `db/migrations/*.sql` in order, records them in `schema_migrations`.
- Spike: confirm Better Auth, `postgres` and `sharp` all work with Next 16.4.5 before building on them.
- `proxy.ts`: exclude `/admin`, `/media` and `/api` from the language redirect.

**Done when:** `docker compose up` + `npm run db:migrate` gives an empty, migrated database.

**Status: done (2026-11-23).**
- `npm run db:up` starts Postgres 17 on host port 5433; `npm run db:migrate` / `db:status` / `db:psql`.
- Runner: one transaction per file, advisory lock, checksum warning if an applied file is edited. Failed migrations roll back fully (tested).
- `0001_baseline.sql` (`set_updated_at()` trigger function), `0002_auth.sql` (Better Auth tables).
- Better Auth: sign-up disabled, staff accounts via `npm run admin:create -- <email> "<name>"`. Login, session and logout tested against a production build.
- `sharp` 0.35 tested inside a route handler (resize + WebP + blur placeholder).
- `GET /api/health` checks the database (for Docker healthcheck / uptime monitor).
- `proxy.ts` skips `/api`, `/admin`, `/media` as whole segments.

## Phase 2 — Database schema (SQL)

Mirrors the client's folders: **discipline → people → photos**, with photos linkable to several
people (group shots exist).

| Table | Purpose | Key columns |
|---|---|---|
| `disciplines` | 16 sports/teams | `slug`, `source_folder`, `name_sq/en`, `description_sq/en`, `cover_photo_id`, `sort_order`, `is_published` |
| `people` | Athletes and coaches (98 today) | `discipline_id`, `slug`, `full_name`, `source_folder`, `role` (athlete / head_coach / assistant_coach), `is_captain`, `shirt_number`, `position`, `birth_year`, `nationality`, `bio_sq/en`, `achievements_sq/en`, `is_minor`, `consent_confirmed`, `portrait_photo_id`, `is_published` |
| `photos` | Metadata only | `discipline_id`, `sha256` (unique, dedupe), `storage_key`, `width`, `height`, `blur_data_url`, `taken_at`, `alt_sq/en`, `is_featured`, `is_published`, `source_path` |
| `photo_people` | Who is in each photo | `photo_id`, `person_id` |
| `news` | Articles | `slug`, `title_sq/en`, `excerpt_sq/en`, `body_sq/en`, `cover_photo_id`, `discipline_id`, `published_at` |
| `fixtures` | Matches and results | `discipline_id`, `opponent`, `is_home`, `starts_at`, `venue`, `competition`, `score_for`, `score_against`, `status` |
| `academy_programs` | Academy offer | `discipline_id`, `name_sq/en`, `age_min`, `age_max`, `schedule_sq/en`, `coach_person_id`, `fee_text`, `is_published` |
| `academy_applications` | Form submissions | `program_id`, `child_name`, `birth_year`, `parent_name`, `phone`, `email`, `notes`, `status` |
| `contact_messages` | Contact form | `name`, `email`, `subject`, `message`, `status` |
| `products` | Shop catalogue (no checkout) | `slug`, `name_sq/en`, `description_sq/en`, `price_lek`, `sizes`, `photo_id`, `is_published` |
| auth tables | Admin users/sessions | Created by the auth library |

Photo files follow one convention, so no variants table is needed:
`photos/<id>/sm.webp` (480 px), `md.webp` (1200 px), `lg.webp` (2000 px, long edge).

**Done when:** all migrations apply cleanly on an empty database and are reviewed.

**Status: done (2026-11-23).** `0003_content.sql` (disciplines, people, photos, photo_people) and
`0004_site.sql` (news, fixtures, academy, contact, form log, products). `npm run db:reset` wipes a
**local** database only and re-applies everything. Rules enforced by the database itself:
- A person cannot be published unless `consent_confirmed` is true.
- Photo ids are random UUIDs, so file URLs cannot be guessed; `sha256` is unique (no duplicates).
- Deleting a photo clears covers/portraits/tags; a discipline with people cannot be deleted.
- Slugs must be lowercase-hyphenated; finished fixtures need both scores; age ranges must be valid.
- Academy applications store a discipline (the form's "sport") and an optional program.
- `form_submissions_log` stores a salted IP hash for rate limiting, never the raw IP.
- Known limit: a person belongs to one discipline (matches the archive). Someone in two
  disciplines would be two rows; revisit only if the client needs it.

## Phase 3 — Import script

`npm run import:photos -- "D:\KS Tirana WEB"` — safe to re-run.

1. Walk `White and Blue Legacy/<DISCIPLINE>/<PERSON>/`; discipline-level loose files (Not, Çiklizëm,
   Ping Pong) become discipline photos with no person.
2. Hash every file; duplicates become **one** photo linked to every person whose folder held it.
3. Parse roles from folder names: `(TRAINER)` → head coach, `(ZV TRAINER)` → assistant coach,
   `(KAPITEN/E)` → captain. Clean names to title case.
4. Top-level curated folders (`Atletike`, `Basketboll_Femra`, …) → `is_featured = true` for that
   discipline (used for covers and heroes).
5. Generate the 3 WebP sizes + blur placeholder; read width, height and date taken.
6. Skip `.NEF` RAW files and print them in a report (client sends JPGs).
7. Upsert by `source_folder` / `sha256`, so re-running updates instead of duplicating.

Second script, `npm run import:workbook -- file.xlsx`, loads the client's corrected workbook
(full names, numbers, bios, consent) into `people` and `disciplines`.

**Done when:** the local database holds 16 disciplines, 98 people and ~607 photos, and the report
lists exactly the known exceptions.

## Phase 4 — Public site on real data

Routes (existing language prefix kept):

```
/[lang]                                  home
/[lang]/sportet                          16 disciplines, cover photo each
/[lang]/sportet/[discipline]             hero, coaches, roster, gallery (24 at a time, "load more")
/[lang]/sportet/[discipline]/[person]    profile + their photos
/[lang]/lajme  /[lang]/lajme/[slug]      news
/[lang]/kalendari  /akademia  /klubi  /dyqani  /kontakt
/media/...                               photo files (route handler locally, nginx/Caddy on VPS)
```

- Data access only through `lib/data/*` functions (`getDisciplines()`, `getPerson()`, …).
- `next/image` with a custom loader that maps requested widths to our 3 sizes; explicit width/height
  and blur placeholder on every photo (no layout jumps).
- UI strings stay in the dictionaries; content comes from `_sq` / `_en` columns.
- Remove the AI-generated placeholder photos from `public/` once real photos are wired in.
- Fix the crest once the client sends the official KS Tirana logo.

**Done when:** every public page renders from the database in both languages, mobile and desktop.

## Phase 5 — Admin panel

Separate root layout at `app/admin/` (Albanian only). Sections:

- **Paneli** — counts, newest applications and messages.
- **Disiplinat** — edit text, choose cover photo, order, publish.
- **Personat** — edit profile, role, portrait, consent, publish.
- **Fotot** — upload (auto-resized), tag people, set featured, publish/hide, delete.
- **Lajmet**, **Ndeshjet**, **Akademia** (programs + applications), **Mesazhet**, **Produktet**.
- **Përdoruesit** — staff accounts.

Every save revalidates the affected public pages.

**Done when:** a staff member can do every content change without touching code.

## Phase 6 — Backend logic

- Server actions for Academy and Contact forms: validate, store, email the club.
- Spam protection: honeypot field + per-IP rate limit.
- Uploads: verify the file really is an image (via `sharp`), size limit, strip metadata.
- Admin actions check the session on the server, never only in the UI.
- Application data includes children's details: admin-only access, plus a retention rule agreed with
  the club.

## Phase 7 — Deployment kit

- `Dockerfile` (standalone output), `docker-compose.yml` for production: app + Postgres + Caddy
  (automatic HTTPS), with volumes for database and photos.
- Build the image on the dev machine or in GitHub Actions; the VPS only runs it (avoids running out
  of memory building on a small VPS).
- `DEPLOY.md` — two routes: VPS (Docker) and Vercel + managed Postgres.
- `scripts/backup.sh` — nightly `pg_dump` + photo folder sync, run by cron on the VPS.
- Upload only the processed photo sizes; the 1.5 GB originals stay with the club as an archive.

**Done when:** a fresh VPS goes from empty to live by following `DEPLOY.md` only.

## Waiting on the client (workbook)

Official KS Tirana crest · JPGs for 4 `.NEF` files · originals of Instagram screenshots · full
names (Gjyzeli, Sena, Zhupi) · consent per person · domain `kstirana.al` access · admin staff
emails · email address for form submissions · Academy programs · shop products · VPS budget.

None of these block Phases 1–3. Phase 4 can proceed with placeholders for missing text.

## Risks

| Risk | Mitigation |
|---|---|
| Libraries not yet compatible with Next 16.4.5 | Phase 1 spike before building on them |
| Small VPS runs out of memory | Build elsewhere; pick at least 4 GB RAM |
| Publishing minors without consent | `consent_confirmed` + `is_published`; launch checklist publishes only consented people |
| Client can't preview online before the VPS | Optional free hosted Postgres (Neon/Supabase) as temporary staging |
| No backups on a self-managed VPS | Backup script + restore test before launch; offer maintenance retainer |
