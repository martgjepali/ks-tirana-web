import "server-only";
import { FIXTURE_STATUSES, NEWS_CATEGORIES, PRODUCT_CATEGORIES, ROLES } from "./lookups";

export type Options = { value: string | number; label: string }[];
type FieldKind = "text" | "textarea" | "number" | "datetime" | "check" | "select" | "slug" | "sizes" | "url" | "photo" | "portrait" | "image";
export type FieldSpec = {
  key: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
  initial?: string | number | boolean;
  options?: Options | "disciplines" | "coaches";
  pair?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  upload?: boolean;
  scoped?: boolean;
};

type Column = { key: string; label: string; kind?: "published" | "date" | "news" | "status"; options?: Options };
export type Section = {
  title: string;
  singular: string;
  table: string;
  name: string;
  fields: FieldSpec[];
  columns: Column[];
  list: string;
  inbox?: { fields: Column[] };
  filters?: ("discipline" | "search" | "status")[];
};

export const APPLICATION_STATUSES = [
  { value: "new", label: "I ri" },
  { value: "contacted", label: "Kontaktuar" },
  { value: "accepted", label: "Pranuar" },
  { value: "rejected", label: "Refuzuar" },
  { value: "archived", label: "Arkivuar" },
];

export const MESSAGE_STATUSES = [
  { value: "new", label: "I ri" },
  { value: "read", label: "Lexuar" },
  { value: "replied", label: "Përgjigjur" },
  { value: "archived", label: "Arkivuar" },
];

const slug: FieldSpec = { key: "slug", label: "Adresa (slug)", kind: "slug", hint: "Për një adresë automatike, lëreni bosh." };
const order: FieldSpec = { key: "sort_order", label: "Rendi", kind: "number", initial: 0 };
const published = (initial = false): FieldSpec => ({ key: "is_published", label: "Publikuar", kind: "check", initial });
const publication: Column = { key: "is_published", label: "Publikimi", kind: "published" };
const discipline = (required = true): FieldSpec => ({ key: "discipline_id", label: "Disiplina", kind: "select", options: "disciplines", required });
const disciplineColumn: Column = { key: "discipline", label: "Disiplina" };
const pair = (key: string, label: string, required = false, kind: FieldKind = "textarea"): FieldSpec => ({ key, label, pair: true, kind, required });
const status = (options: Options): FieldSpec => ({ key: "status", label: "Statusi", kind: "select", required: true, initial: options[0].value, options });
const statusColumn = (options: Options): Column => ({ key: "status", label: "Statusi", kind: "status", options });
const time = (key: string) => `to_char(t.${key} AT TIME ZONE 'Europe/Tirane', 'YYYY-MM-DD"T"HH24:MI')`;
const withDiscipline = "LEFT JOIN disciplines d ON d.id = t.discipline_id";

const sections: Record<string, Section> = {
  lajme: {
    title: "Lajmet", singular: "Lajm", table: "news", name: "title_sq",
    fields: [
      pair("title", "Titulli", true, "text"), slug,
      { key: "category", label: "Kategoria", kind: "select", options: NEWS_CATEGORIES, initial: "lajm", required: true },
      discipline(false), { key: "published_at", label: "Publikimi (ora e Tiranës)", kind: "datetime", hint: "Lëreni bosh për ta mbajtur si draft." },
      pair("excerpt", "Përmbledhja"), pair("body", "Artikulli"),
      { key: "cover_photo_id", label: "Fotoja e kopertinës", kind: "photo", upload: true },
    ],
    columns: [{ key: "title_sq", label: "Titulli" }, disciplineColumn, { key: "published_at", label: "Publikimi", kind: "news" }],
    list: `SELECT t.id, t.title_sq, t.published_at, d.name_sq AS discipline FROM news t ${withDiscipline} ORDER BY t.updated_at DESC, t.id DESC`,
  },
  ndeshjet: {
    title: "Ndeshjet & kalendari", singular: "Ndeshje", table: "fixtures", name: "opponent",
    fields: [
      discipline(), { key: "opponent", label: "Kundërshtari", required: true },
      { key: "starts_at", label: "Data dhe ora (Tiranë)", kind: "datetime", required: true }, status(FIXTURE_STATUSES),
      { key: "venue", label: "Vendi" }, { key: "competition", label: "Gara" },
      { key: "score_for", label: "Pikët e Tiranës", kind: "number", min: 0, max: 32767 },
      { key: "score_against", label: "Pikët e kundërshtarit", kind: "number", min: 0, max: 32767 },
      pair("notes", "Shënime"), { key: "is_home", label: "Ndeshje në shtëpi", kind: "check", initial: true },
    ],
    columns: [{ key: "opponent", label: "Kundërshtari" }, disciplineColumn, { key: "starts_at", label: "Data", kind: "date" }, { key: "score", label: "Rezultati" }, statusColumn(FIXTURE_STATUSES)],
    list: `SELECT t.id, t.opponent, t.starts_at, t.status, d.name_sq AS discipline,
      CASE WHEN t.score_for IS NOT NULL THEN concat(t.score_for, ' : ', t.score_against) END AS score
      FROM fixtures t ${withDiscipline} ORDER BY t.starts_at DESC, t.id DESC`,
  },
  disiplinat: {
    title: "Disiplinat", singular: "Disiplinë", table: "disciplines", name: "name_sq",
    fields: [
      pair("name", "Emri", true, "text"), slug, { key: "venue", label: "Ambienti / palestra" },
      pair("description", "Përshkrimi"), pair("age_groups", "Grupmoshat"), pair("schedule", "Orari"),
      pair("achievements", "Arritjet"), order, published(),
      { key: "cover_photo_id", label: "Fotoja e kopertinës", kind: "photo", scoped: true },
    ],
    columns: [{ key: "name_sq", label: "Disiplina" }, { key: "sort_order", label: "Rendi" }, publication],
    list: "SELECT t.id, t.name_sq, t.sort_order, t.is_published FROM disciplines t ORDER BY t.sort_order, t.name_sq, t.id",
  },
  personat: {
    title: "Sportistët & stafi", singular: "Person", table: "people", name: "full_name",
    fields: [
      { key: "full_name", label: "Emri i plotë", required: true }, discipline(), slug,
      { key: "role", label: "Roli", kind: "select", options: ROLES, required: true, initial: "athlete" },
      { key: "position", label: "Pozicioni / titulli në staf" },
      { key: "shirt_number", label: "Numri i fanellës", kind: "number", min: 0, max: 999 },
      { key: "birth_year", label: "Viti i lindjes", kind: "number", min: 1900, max: 2100 },
      { key: "nationality", label: "Shtetësia" }, pair("bio", "Biografia"), pair("achievements", "Arritjet"),
      order, { key: "is_captain", label: "Kapiten/e", kind: "check" },
      { key: "is_minor", label: "I/e mitur", kind: "check" },
      { key: "consent_confirmed", label: "Pëlqimi është konfirmuar", kind: "check", hint: "I detyrueshëm për publikimin e profilit." },
      { key: "consent_note", label: "Shënime për pëlqimin", kind: "textarea" }, published(),
      { key: "portrait_photo_id", label: "Portreti", kind: "portrait" },
    ],
    columns: [{ key: "full_name", label: "Personi" }, disciplineColumn, { key: "role", label: "Roli", options: ROLES }, publication],
    filters: ["discipline", "search"],
    list: `SELECT t.id, t.full_name, t.role, t.is_published, d.name_sq AS discipline
      FROM people t ${withDiscipline}
      WHERE ($1::int IS NULL OR t.discipline_id = $1) AND ($2 = '' OR t.full_name ILIKE '%' || $2 || '%')
      ORDER BY t.full_name, t.id`,
  },
  akademia: {
    title: "Programet e Akademisë", singular: "Program", table: "academy_programs", name: "name_sq",
    fields: [
      pair("name", "Emri", true, "text"), discipline(), slug, pair("description", "Përshkrimi"),
      { key: "age_min", label: "Mosha minimale", kind: "number", min: 3, max: 25 },
      { key: "age_max", label: "Mosha maksimale", kind: "number", min: 3, max: 25 }, pair("schedule", "Orari"),
      { key: "coach_person_id", label: "Trajneri", kind: "select", options: "coaches" },
      { key: "fee_text", label: "Tarifa" }, order, published(),
    ],
    columns: [{ key: "name_sq", label: "Programi" }, disciplineColumn, publication],
    list: `SELECT t.id, t.name_sq, t.is_published, d.name_sq AS discipline FROM academy_programs t ${withDiscipline} ORDER BY t.sort_order, t.id`,
  },
  aplikimet: {
    title: "Aplikimet në Akademi", singular: "Aplikim", table: "academy_applications", name: "child_name",
    fields: [status(APPLICATION_STATUSES), { key: "staff_notes", label: "Shënime të stafit", kind: "textarea" }],
    columns: [{ key: "child_name", label: "Fëmija" }, { key: "parent_name", label: "Prindi" }, { key: "created_at", label: "Marrë më", kind: "date" }, statusColumn(APPLICATION_STATUSES)],
    inbox: { fields: [
      { key: "parent_name", label: "Prindi" }, { key: "birth_year", label: "Viti i lindjes" },
      { key: "email", label: "Email" }, { key: "phone", label: "Telefoni" },
      disciplineColumn, { key: "programme", label: "Programi" }, { key: "notes", label: "Shënimet e aplikimit" },
    ] },
    filters: ["status"],
    list: "SELECT t.id, t.child_name, t.parent_name, t.status, t.created_at FROM academy_applications t WHERE ($1::text IS NULL OR t.status::text = $1) ORDER BY t.created_at DESC, t.id DESC",
  },
  mesazhet: {
    title: "Mesazhet", singular: "Mesazh", table: "contact_messages", name: "name",
    fields: [status(MESSAGE_STATUSES), { key: "staff_notes", label: "Shënime të stafit", kind: "textarea" }],
    columns: [{ key: "name", label: "Dërguesi" }, { key: "subject", label: "Subjekti" }, { key: "created_at", label: "Marrë më", kind: "date" }, statusColumn(MESSAGE_STATUSES)],
    inbox: { fields: [{ key: "email", label: "Email" }, { key: "subject", label: "Subjekti" }, { key: "message", label: "Mesazhi" }] },
    filters: ["status"],
    list: "SELECT t.id, t.name, t.subject, t.status, t.created_at FROM contact_messages t WHERE ($1::text IS NULL OR t.status::text = $1) ORDER BY t.created_at DESC, t.id DESC",
  },
  produktet: {
    title: "Produktet", singular: "Produkt", table: "products", name: "name_sq",
    fields: [
      pair("name", "Emri", true, "text"), slug,
      { key: "category", label: "Kategoria", kind: "select", options: PRODUCT_CATEGORIES, initial: "fanella", required: true },
      pair("description", "Përshkrimi"), { key: "price_lek", label: "Çmimi në lekë", kind: "number", min: 0, hint: "Lëreni bosh nëse çmimi jepet në klub." },
      { key: "sizes", label: "Masat", kind: "sizes", hint: "Ndajini me presje, p.sh. S, M, L." },
      { key: "photo_id", label: "Fotoja e produktit", kind: "photo", upload: true }, order,
      { key: "in_stock", label: "Në gjendje", kind: "check", initial: true }, published(),
    ],
    columns: [{ key: "name_sq", label: "Produkti" }, { key: "category", label: "Kategoria", options: PRODUCT_CATEGORIES }, { key: "price_lek", label: "Çmimi (lekë)" }, publication],
    list: "SELECT t.id, t.name_sq, t.price_lek, t.category, t.is_published FROM products t ORDER BY t.sort_order, t.id",
  },
  partneret: {
    title: "Partnerët & sponsorët", singular: "Partner", table: "partners", name: "name",
    fields: [
      { key: "name", label: "Emri", required: true }, { key: "website", label: "Faqja e internetit", kind: "url" },
      { key: "logo_url", label: "Logoja", kind: "image", required: true },
      { key: "is_main_supporter", label: "Mbështetësi kryesor", kind: "check", hint: "Faqja shfaq një mbështetës kryesor. Nëse ka disa, përdoret i pari sipas rendit." },
      order, published(true),
    ],
    columns: [{ key: "name", label: "Partneri" }, { key: "sort_order", label: "Rendi" }, publication],
    list: "SELECT t.id, t.name, t.sort_order, t.is_published FROM partners t ORDER BY t.sort_order, t.id",
  },
  revista: {
    title: "Revista", singular: "Numër i revistës", table: "magazine_issues", name: "number",
    fields: [
      { key: "number", label: "Numri", kind: "number", required: true, min: 1 },
      pair("date", "Data e botimit", false, "text"), { key: "cover_url", label: "Kopertina", kind: "image", required: true },
      published(true),
    ],
    columns: [{ key: "number", label: "Numri" }, { key: "date_sq", label: "Data e botimit" }, publication],
    list: "SELECT t.id, t.number, t.date_sq, t.is_published FROM magazine_issues t ORDER BY t.number DESC",
  },
};

export const getSection = (key: string) => Object.hasOwn(sections, key) ? sections[key] : undefined;

export function detailSql(section: Section) {
  const times = section.fields.filter((f) => f.kind === "datetime").map((f) => `${time(f.key)} AS ${f.key}`);
  const extras = section.table === "academy_applications" ? [
    "d.name_sq AS discipline", "a.name_sq AS programme",
  ] : [];
  const join = extras.length ? `${withDiscipline} LEFT JOIN academy_programs a ON a.id = t.program_id` : "";
  return `SELECT ${["t.*", ...times, ...extras].join(", ")} FROM ${section.table} t ${join} WHERE t.id = $1`;
}
