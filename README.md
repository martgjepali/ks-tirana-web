# KS Tirana — website

Official site of Klubi Sportiv Tirana: disciplines, athletes, photo archive, news, calendar,
academy and shop, in Albanian (`/sq`) and English (`/en`). Next.js 16, Postgres, Tailwind 4.
The build plan and decisions are in [docs/PLAN.md](docs/PLAN.md).

## Local development

Needs Node 20+ and Docker Desktop (running).

```bash
npm install
cp .env.example .env        # then fill in the values below
npm run dev:setup           # local database + copy of the deployed data + photos
npm run dev                 # http://localhost:3000
```

Values in `.env` for `dev:setup`:

| Variable | Where to find it |
|---|---|
| `BETTER_AUTH_SECRET` | Any random string: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `SOURCE_DATABASE_URL` | Vercel → Storage → the Neon database → `DATABASE_URL` (or a Neon dev branch). Only read, never written. |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → the Blob store → `.env.local` tab. Only read by `photos:pull`. |

Leave `DATABASE_URL` pointing at `localhost:5433` and `STORAGE_DRIVER=local`: the site then runs
entirely on this machine and changes never reach the live site.

`dev:setup` runs three steps that can also be run on their own:

| Command | What it does |
|---|---|
| `npm run db:up` | Starts Postgres 17 in Docker (port 5433). `npm run db:down` stops it. |
| `npm run db:pull` | Replaces the local database with a copy of `SOURCE_DATABASE_URL`, then applies any newer migrations. Academy applications, contact messages and logins are not copied. |
| `npm run photos:pull` | Downloads the processed photos from Blob into `storage/` (~190 MB, skips files already there). |

Re-run `db:pull` whenever you want fresh content. `CONTENT_PREVIEW=true` in `.env` also shows
people whose consent is not recorded yet (dev server only).

## Staff admin

The Albanian staff panel is at `/admin`. It manages disciplines, people and consent, photos,
news, fixtures and results, academy programmes, applications, contact messages, products,
partners, magazine issues, site settings, bilingual texts and staff accounts.

For an existing local database, apply the pending migrations and create the first local login.
Use `npm.cmd` in Windows PowerShell if it blocks `npm.ps1`.

```powershell
npm.cmd run db:up
npm.cmd run db:migrate
npm.cmd run admin:create -- staff@example.com "Staff Name"
npm.cmd run dev
```

Open `http://localhost:3000/admin` and enter the temporary password printed by the create command.
Change it under **Fjalëkalimi im**. Staff can then create accounts from **Përdoruesit**. Running
`admin:create` for an existing email resets that account's password.

News with an empty publication date stays in draft. Times in the news and fixture editors are
Tirana time. Confirm consent before publishing a person. Saved public content is read on the next
request. The academy and contact forms deliver submissions to the staff inboxes.

### Before deploying to Vercel

1. Run the migrations against the live Neon database **before deploying this code**. This release
   needs `0007_admin_content.sql` and `0008_contact_staff_notes.sql`.
2. Set `BETTER_AUTH_SECRET` and the production `BETTER_AUTH_URL` in Vercel. Connect the private
   Blob store for persistent uploads.
3. Create the first live staff account against the same Neon database.

In a dedicated PowerShell session with `DEPLOY_DATABASE_URL` set privately to a writable live
Neon connection string:

```powershell
if (-not $env:DEPLOY_DATABASE_URL) { throw "Set DEPLOY_DATABASE_URL first." }
$previousDatabaseUrl = $env:DATABASE_URL
try {
  $env:DATABASE_URL = $env:DEPLOY_DATABASE_URL
  npm.cmd run db:migrate
  if ($LASTEXITCODE -ne 0) { throw "Migration failed." }
  npm.cmd run admin:create -- staff@example.com "Staff Name"
  if ($LASTEXITCODE -ne 0) { throw "Account creation failed." }
} finally {
  $env:DATABASE_URL = $previousDatabaseUrl
}
```

## Other commands

| Command | What it does |
|---|---|
| `npm run db:migrate` / `db:status` | Apply / list migrations in `db/migrations/` |
| `npm run db:psql` | SQL shell on the local database |
| `npm run db:reset` | Wipe the local database and re-run migrations (refuses non-local databases) |
| `npm run admin:create -- email "Name"` | Create a staff login (prints a password) |
| `npm run import:photos -- "<archive folder>"` | Import the club's original photo archive |
| `npm run import:workbook -- file.xlsx` | Load the club's data workbook into people and disciplines |
| `npm run import:rosters` | Load the official team lists from the final design (publishes those people) |
| `npm run seed:demo` | Add EXAMPLE news, fixtures and products for the MVP (`-- --remove` deletes them) |
| `npm run blob:upload` | Upload local processed photos to the Blob store |

## Temporary password for admin
KHs4jQUS7rLD3pAj