-- News, fixtures, academy, contact and the shop catalogue (display only, no checkout).

CREATE TYPE fixture_status     AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
CREATE TYPE application_status AS ENUM ('new', 'contacted', 'accepted', 'rejected', 'archived');
CREATE TYPE message_status     AS ENUM ('new', 'read', 'replied', 'archived');

-- ----------------------------------------------------------------------- news
CREATE TABLE news (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug            slug NOT NULL UNIQUE,
  title_sq        text NOT NULL CHECK (btrim(title_sq) <> ''),
  title_en        text,
  excerpt_sq      text,
  excerpt_en      text,
  body_sq         text NOT NULL DEFAULT '',
  body_en         text,
  cover_photo_id  uuid REFERENCES photos (id) ON DELETE SET NULL,
  discipline_id   integer REFERENCES disciplines (id) ON DELETE SET NULL,
  -- NULL = draft. A future date = scheduled; it appears once that time passes.
  published_at    timestamptz,
  author_id       text REFERENCES "user" (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX news_published_idx ON news (published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX news_discipline_idx ON news (discipline_id, published_at DESC);

-- ------------------------------------------------------------------- fixtures
CREATE TABLE fixtures (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  discipline_id  integer NOT NULL REFERENCES disciplines (id) ON DELETE RESTRICT,
  opponent       text NOT NULL CHECK (btrim(opponent) <> ''),
  is_home        boolean NOT NULL DEFAULT true,
  starts_at      timestamptz NOT NULL,
  venue          text,
  competition    text,
  score_for      smallint CHECK (score_for >= 0),
  score_against  smallint CHECK (score_against >= 0),
  status         fixture_status NOT NULL DEFAULT 'scheduled',
  notes_sq       text,
  notes_en       text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fixtures_score_pair CHECK ((score_for IS NULL) = (score_against IS NULL)),
  CONSTRAINT fixtures_finished_has_score CHECK (status <> 'finished' OR score_for IS NOT NULL)
);

CREATE INDEX fixtures_starts_idx ON fixtures (starts_at);
CREATE INDEX fixtures_discipline_idx ON fixtures (discipline_id, starts_at);

-- -------------------------------------------------------------------- academy
CREATE TABLE academy_programs (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  discipline_id    integer NOT NULL REFERENCES disciplines (id) ON DELETE RESTRICT,
  slug             slug NOT NULL UNIQUE,
  name_sq          text NOT NULL CHECK (btrim(name_sq) <> ''),
  name_en          text,
  description_sq   text,
  description_en   text,
  age_min          smallint CHECK (age_min BETWEEN 3 AND 25),
  age_max          smallint CHECK (age_max BETWEEN 3 AND 25),
  schedule_sq      text,
  schedule_en      text,
  coach_person_id  integer REFERENCES people (id) ON DELETE SET NULL,
  fee_text         text,               -- free text, e.g. "3 000 L / muaj"
  sort_order       integer NOT NULL DEFAULT 0,
  is_published     boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT academy_programs_age_range CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max)
);

-- Holds children's personal data: admin-only, deleted after the agreed retention period.
CREATE TABLE academy_applications (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- The form asks for a sport; a program is optional until the club defines programs.
  discipline_id  integer REFERENCES disciplines (id) ON DELETE SET NULL,
  program_id     integer REFERENCES academy_programs (id) ON DELETE SET NULL,
  child_name     text NOT NULL CHECK (btrim(child_name) <> ''),
  birth_year     smallint NOT NULL CHECK (birth_year BETWEEN 1990 AND 2100),
  parent_name    text NOT NULL CHECK (btrim(parent_name) <> ''),
  phone          text NOT NULL,
  email          text NOT NULL,
  notes          text,
  locale         text NOT NULL DEFAULT 'sq' CHECK (locale IN ('sq', 'en')),
  status         application_status NOT NULL DEFAULT 'new',
  staff_notes    text,
  handled_by     text REFERENCES "user" (id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX academy_applications_inbox_idx ON academy_applications (status, created_at DESC);

-- -------------------------------------------------------------------- contact
CREATE TABLE contact_messages (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL CHECK (btrim(name) <> ''),
  email       text NOT NULL,
  subject     text,
  message     text NOT NULL CHECK (btrim(message) <> ''),
  locale      text NOT NULL DEFAULT 'sq' CHECK (locale IN ('sq', 'en')),
  status      message_status NOT NULL DEFAULT 'new',
  handled_by  text REFERENCES "user" (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_messages_inbox_idx ON contact_messages (status, created_at DESC);

-- Per-IP form throttling (Phase 6). Stores a salted hash, never the raw IP.
CREATE TABLE form_submissions_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form        text NOT NULL,
  ip_hash     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX form_submissions_log_lookup_idx ON form_submissions_log (form, ip_hash, created_at DESC);

-- ------------------------------------------------------------------- products
CREATE TABLE products (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug            slug NOT NULL UNIQUE,
  name_sq         text NOT NULL CHECK (btrim(name_sq) <> ''),
  name_en         text,
  description_sq  text,
  description_en  text,
  price_lek       integer CHECK (price_lek >= 0),   -- NULL = "ask at the club"
  sizes           text[] NOT NULL DEFAULT '{}',
  photo_id        uuid REFERENCES photos (id) ON DELETE SET NULL,
  in_stock        boolean NOT NULL DEFAULT true,
  sort_order      integer NOT NULL DEFAULT 0,
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON news                 FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON fixtures             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON academy_programs     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON academy_applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contact_messages     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
