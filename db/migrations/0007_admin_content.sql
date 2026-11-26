-- Content that used to live in code (lib/club.ts, dictionaries) and is now edited in /admin.

-- ------------------------------------------------------------------ partners
-- Sponsors in the sliding logo bar, plus the main supporter (Bashkia Tiranë).
CREATE TABLE partners (
  id                 integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name               text NOT NULL CHECK (btrim(name) <> ''),
  logo_url           text NOT NULL,          -- "/images/partners/x.png" or "/media/uploads/<id>.png"
  website            text,
  is_main_supporter  boolean NOT NULL DEFAULT false,
  sort_order         integer NOT NULL DEFAULT 0,
  is_published       boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------ magazine
CREATE TABLE magazine_issues (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  number        integer NOT NULL UNIQUE CHECK (number > 0),
  date_sq       text,                         -- "Dhjetor 2026"
  date_en       text,
  cover_url     text NOT NULL,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE magazine_pages (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  issue_id    integer NOT NULL REFERENCES magazine_issues (id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE INDEX magazine_pages_issue_idx ON magazine_pages (issue_id, sort_order);

-- ------------------------------------------------------------------ settings
-- One JSON document per key; the app merges it over built-in defaults.
CREATE TABLE site_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Page texts edited in admin, overriding app/[lang]/dictionaries/*.json.
-- key is a dotted path, e.g. "home.hero.subtitle" or "home.hero.title.0".
CREATE TABLE site_texts (
  locale      text NOT NULL CHECK (locale IN ('sq', 'en')),
  key         text NOT NULL,
  value       text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, key)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON partners        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON magazine_issues FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------- initial data
-- The values the site showed before the admin panel existed (logos ship in public/).
INSERT INTO partners (name, logo_url, is_main_supporter, sort_order) VALUES
  ('Bashkia Tiranë', '/images/partners/bashkia-tirane.png', true, 0),
  ('Sixt', '/images/partners/sixt.png', false, 1),
  ('Selita', '/images/partners/selita.png', false, 2),
  ('Raiffeisen Invest', '/images/partners/raiffeisen-invest.png', false, 3),
  ('Geely', '/images/partners/geely.png', false, 4),
  ('Delfino', '/images/partners/delfino.png', false, 5);

INSERT INTO magazine_issues (number, date_sq, date_en, cover_url) VALUES
  (1, 'Mars 2026', 'March 2026', '/images/demo/revista-cover.png'),
  (2, 'Qershor 2026', 'June 2026', '/images/demo/revista-cover.png'),
  (3, 'Shtator 2026', 'September 2026', '/images/demo/revista-cover.png'),
  (4, 'Dhjetor 2026', 'December 2026', '/images/demo/revista-cover.png');
