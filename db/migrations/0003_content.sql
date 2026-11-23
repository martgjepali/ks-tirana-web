-- Club structure mirroring the client's archive: discipline → people → photos.
-- A photo can show several people (group shots), hence photo_people.
--
-- Publishing rules enforced here, not only in the app:
--   * a person can only be published once consent is confirmed
--   * photo ids are random UUIDs, so file URLs (photos/<uuid>/md.webp) cannot be guessed

CREATE TYPE person_role AS ENUM ('athlete', 'head_coach', 'assistant_coach');

-- Lowercase words joined by single hyphens, e.g. "basketboll-femra".
CREATE DOMAIN slug AS text
  CHECK (VALUE ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(VALUE) <= 120);

-- ---------------------------------------------------------------- disciplines
CREATE TABLE disciplines (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug            slug NOT NULL UNIQUE,
  -- Folder name under "White and Blue Legacy/", used by the import script.
  source_folder   text UNIQUE,
  name_sq         text NOT NULL CHECK (btrim(name_sq) <> ''),
  name_en         text,
  description_sq  text,
  description_en  text,
  cover_photo_id  uuid,               -- FK added below (photos is created later)
  sort_order      integer NOT NULL DEFAULT 0,
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------- people
CREATE TABLE people (
  id                 integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  discipline_id      integer NOT NULL REFERENCES disciplines (id) ON DELETE RESTRICT,
  slug               slug NOT NULL,
  full_name          text NOT NULL CHECK (btrim(full_name) <> ''),
  -- "<discipline folder>/<person folder>", used by the import script.
  source_folder      text UNIQUE,
  role               person_role NOT NULL DEFAULT 'athlete',
  is_captain         boolean NOT NULL DEFAULT false,
  shirt_number       smallint CHECK (shirt_number BETWEEN 0 AND 999),
  position           text,
  birth_year         smallint CHECK (birth_year BETWEEN 1900 AND 2100),
  nationality        text,
  bio_sq             text,
  bio_en             text,
  achievements_sq    text,
  achievements_en    text,
  is_minor           boolean NOT NULL DEFAULT false,
  consent_confirmed  boolean NOT NULL DEFAULT false,
  consent_note       text,            -- who gave consent and when
  portrait_photo_id  uuid,            -- FK added below
  sort_order         integer NOT NULL DEFAULT 0,
  is_published       boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (discipline_id, slug),
  CONSTRAINT people_publish_requires_consent CHECK (NOT is_published OR consent_confirmed)
);

CREATE INDEX people_discipline_idx ON people (discipline_id, role, sort_order);

-- --------------------------------------------------------------------- photos
-- Metadata only. Files live in storage at photos/<id>/{sm,md,lg}.webp.
CREATE TABLE photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id   integer REFERENCES disciplines (id) ON DELETE RESTRICT,
  sha256          text NOT NULL UNIQUE CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  storage_key     text NOT NULL UNIQUE,   -- "photos/<id>"
  width           integer NOT NULL CHECK (width > 0),   -- of the largest stored size
  height          integer NOT NULL CHECK (height > 0),
  blur_data_url   text,
  taken_at        timestamptz,
  alt_sq          text,
  alt_en          text,
  is_featured     boolean NOT NULL DEFAULT false,  -- curated: covers, heroes
  is_published    boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  -- Every archive path that held this exact file (duplicates are merged).
  source_paths    text[] NOT NULL DEFAULT '{}',
  uploaded_by     text REFERENCES "user" (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX photos_discipline_idx ON photos (discipline_id, is_published, is_featured DESC, sort_order);

CREATE TABLE photo_people (
  photo_id   uuid    NOT NULL REFERENCES photos (id) ON DELETE CASCADE,
  person_id  integer NOT NULL REFERENCES people (id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, person_id)
);

CREATE INDEX photo_people_person_idx ON photo_people (person_id);

-- Covers and portraits point at photos; deleting the photo just clears them.
ALTER TABLE disciplines
  ADD CONSTRAINT disciplines_cover_photo_fk
  FOREIGN KEY (cover_photo_id) REFERENCES photos (id) ON DELETE SET NULL;
ALTER TABLE people
  ADD CONSTRAINT people_portrait_photo_fk
  FOREIGN KEY (portrait_photo_id) REFERENCES photos (id) ON DELETE SET NULL;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON disciplines FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON people      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON photos      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
