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
