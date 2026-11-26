/**
 * EXAMPLE content for the MVP demo: news, fixtures and shop products, so every
 * page of the client's design shows something before staff add real content.
 *
 *   npm run seed:demo              add (replaces earlier example rows)
 *   npm run seed:demo -- --remove  delete every example row
 *
 * Every row is marked: news and products have slugs starting with "shembull-",
 * fixtures have notes_sq = "SHEMBULL". Nothing else is touched.
 */
import { getPool } from "../lib/db/pool";

try {
  process.loadEnvFile();
} catch {}

const NEWS = [
  { d: "volejboll-femra", cat: "lajm", sq: "Vajzat e Tiranës sigurojnë fitore të rëndësishme në shtëpi", en: "Tirana's women secure an important home win", ex: "Një paraqitje bindëse dhe mbështetje e jashtëzakonshme nga tifozët në Pallatin e Sportit." },
  { d: null, cat: "akademia", sq: "Gjenerata e re po rritet", en: "The new generation is growing", ex: "Akademia e KS Tirana vijon të sjellë talente të reja në të gjitha sportet." },
  { d: "basketboll-meshkuj", cat: "lajm", sq: "Hapet sezoni i ri në transfertë", en: "The new season opens away from home", ex: "Një fillim i mirë për ekipin tonë që tregon ambicie të mëdha për këtë sezon." },
  { d: "atletike", cat: "lajm", sq: "Rekord i ri personal për atletët tanë", en: "New personal bests for our athletes", ex: "Atletët e KS Tiranës shënojnë rezultate të reja në mitingun kombëtar." },
  { d: "basketboll-meshkuj", cat: "intervista", sq: "Intervistë me trajnerin e ekipit të basketbollit", en: "Interview with the basketball coach", ex: "Objektivat e sezonit, ekipi dhe mbështetja e tifozëve." },
  { d: null, cat: "klubi", sq: "Klubi prezanton programin e ri të zhvillimit", en: "The club presents its new development programme", ex: "Një plan për sportistët e rinj, trajnerët dhe ambientet e klubit." },
  { d: "not", cat: "lajm", sq: "Tirana shkëlqen në kampionatin kombëtar të notit", en: "Tirana shines at the national swimming championship", ex: "Medalje dhe kohë të reja personale për notarët tanë." },
  { d: null, cat: "komuniteti", sq: "Sporti në shkolla – së bashku për një brez më aktiv", en: "Sport in schools – together for a more active generation", ex: "Sportistët e KS Tiranës vizitojnë shkollat e kryeqytetit." },
];

const FIXTURES = [
  { d: "basketboll-meshkuj", opp: "KS Teuta", home: true, days: 3, hour: 18, venue: 'Pallati i Sportit "Farie Hoti", Tiranë', comp: "Superliga" },
  { d: "volejboll-femra", opp: "KV Partizani", home: true, days: 6, hour: 19, venue: 'Pallati i Sportit "Farie Hoti", Tiranë', comp: "Kampionati Kombëtar" },
  { d: "atletike", opp: "Garë individuale", home: true, days: 12, hour: 11, venue: "Stadiumi i Atletikës, Tiranë", comp: "Miting kombëtar" },
  { d: "not", opp: "Kampionati Kombëtar", home: true, days: 16, hour: 10, venue: "Pishina Olimpike, Tiranë", comp: "Kampionati Kombëtar" },
  { d: "volejboll-meshkuj", opp: "KV Vllaznia", home: false, days: 9, hour: 17, venue: "Pallati i Sportit, Shkodër", comp: "Kampionati Kombëtar" },
  { d: "basketboll-femra", opp: "BC Flamurtari", home: true, days: 20, hour: 18, venue: 'Pallati i Sportit "Farie Hoti", Tiranë', comp: "Kampionati Kombëtar" },
  { d: "basketboll-meshkuj", opp: "BC Vllaznia", home: false, days: -4, hour: 18, venue: "Pallati i Sportit, Shkodër", comp: "Superliga", score: [81, 74] },
  { d: "volejboll-femra", opp: "KV Teuta", home: true, days: -8, hour: 19, venue: 'Pallati i Sportit "Farie Hoti", Tiranë', comp: "Kampionati Kombëtar", score: [3, 1] },
];

const PRODUCTS = [
  { slug: "fanelle-ndeshje-shtepie", sq: "Fanellë Ndeshje Shtëpie", en: "Home match jersey", cat: "fanella", price: 4500, sizes: ["S", "M", "L", "XL"] },
  { slug: "fanelle-ndeshje-personalizuar", sq: "Fanellë Ndeshje Shtëpie – Personalizuar", en: "Home match jersey – personalised", cat: "fanella", price: 5500, sizes: ["S", "M", "L", "XL"] },
  { slug: "xhakete-stervitje", sq: "Xhaketë Stërvitje Bardheblu", en: "White and blue training jacket", cat: "stervitje", price: 6000, sizes: ["S", "M", "L", "XL"] },
  { slug: "fanelle-stervitje", sq: "Fanellë Stërvitje", en: "Training shirt", cat: "stervitje", price: 2500, sizes: ["S", "M", "L", "XL"] },
  { slug: "kapele", sq: "Kapelë", en: "Cap", cat: "aksesore", price: 1500, sizes: [] },
  { slug: "shall-tifozesh", sq: "Shall Tifozësh", en: "Supporters' scarf", cat: "aksesore", price: 1200, sizes: [] },
];

async function main() {
  const remove = process.argv.includes("--remove");
  const pool = getPool();
  const host = new URL(process.env.DATABASE_URL ?? "postgres://localhost").hostname;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM news WHERE slug LIKE 'shembull-%'");
    await client.query("DELETE FROM fixtures WHERE notes_sq = 'SHEMBULL'");
    await client.query("DELETE FROM products WHERE slug LIKE 'shembull-%'");

    if (!remove) {
      for (const [i, n] of NEWS.entries()) {
        await client.query(
          `INSERT INTO news (slug, title_sq, title_en, excerpt_sq, body_sq, category, discipline_id, cover_photo_id, published_at)
           SELECT $1, $2, $3, $4, $4 || E'\n\n' || 'Ky është një artikull shembull për prezantimin e faqes.',
                  $5::news_category, d.id,
                  (SELECT ph.id FROM photos ph LEFT JOIN disciplines pd ON pd.id = ph.discipline_id
                   WHERE ph.is_published AND ph.width > ph.height AND ($6::text IS NULL OR pd.slug = $6)
                   ORDER BY ph.is_featured DESC, ph.sort_order OFFSET $7 LIMIT 1),
                  now() - ($8 || ' days')::interval
           FROM (SELECT 1) one LEFT JOIN disciplines d ON d.slug = $6`,
          [`shembull-${i + 1}`, n.sq, n.en, n.ex, n.cat, n.d, i % 3, i * 2 + 1],
        );
      }
      for (const f of FIXTURES) {
        await client.query(
          `INSERT INTO fixtures (discipline_id, opponent, is_home, starts_at, venue, competition, status, score_for, score_against, notes_sq)
           SELECT d.id, $2, $3, date_trunc('day', now()) + ($4 || ' days')::interval + ($5 || ' hours')::interval,
                  $6, $7, $8::fixture_status, $9, $10, 'SHEMBULL'
           FROM disciplines d WHERE d.slug = $1`,
          [f.d, f.opp, f.home, f.days, f.hour, f.venue, f.comp, f.score ? "finished" : "scheduled", f.score?.[0] ?? null, f.score?.[1] ?? null],
        );
      }
      for (const [i, p] of PRODUCTS.entries()) {
        await client.query(
          `INSERT INTO products (slug, name_sq, name_en, category, price_lek, sizes, sort_order, is_published)
           VALUES ($1, $2, $3, $4::product_category, $5, $6, $7, true)`,
          [`shembull-${p.slug}`, p.sq, p.en, p.cat, p.price, p.sizes, i],
        );
      }
    }
    await client.query("COMMIT");
    console.log(
      remove
        ? `Removed all example content from ${host}.`
        : `Added example content to ${host}: ${NEWS.length} news, ${FIXTURES.length} fixtures, ${PRODUCTS.length} products.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
