"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { query, transaction } from "@/lib/db/pool";

/*
 * Public form submissions (Academy application, contact message). Stored in the
 * database and shown in /admin → Aplikimet / Mesazhet. Spam protection: a hidden
 * "website" field bots fill in, and at most 5 submissions per IP per hour
 * (the IP is stored only as a salted hash).
 */

export type FormState = { status: "idle" | "done" | "error"; message?: "invalid" | "limit" | "server" };

const LIMIT_PER_HOUR = 5;

async function allowed(form: string): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.BETTER_AUTH_SECRET ?? "ks-tirana";
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  return transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`forms:${form}:${ipHash}`]);
    const { rows: [row] } = await client.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM form_submissions_log WHERE form = $1 AND ip_hash = $2 AND created_at > now() - interval '1 hour'`,
      [form, ipHash],
    );
    if (row.n >= LIMIT_PER_HOUR) return false;
    await client.query("INSERT INTO form_submissions_log (form, ip_hash) VALUES ($1, $2)", [form, ipHash]);
    return true;
  });
}

const text = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null);
const locale = z.enum(["sq", "en"]).catch("sq");

const Application = z.object({
  child_name: text(120),
  birth_date: z.iso.date(),
  program: text(120),
  experience: optional(500),
  parent_name: text(120),
  phone: text(40),
  email: z.string().trim().email().max(160),
  locale,
});

export async function submitApplication(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) return { status: "done" }; // honeypot: pretend success
  const parsed = Application.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "invalid" };
  const d = parsed.data;
  const birthYear = Number(d.birth_date.slice(0, 4));
  if (birthYear < 1990 || new Date(d.birth_date).getTime() > Date.now()) return { status: "error", message: "invalid" };
  try {
    if (!(await allowed("academy"))) return { status: "error", message: "limit" };
    const [application] = await query(
      `INSERT INTO academy_applications (program_id, discipline_id, child_name, birth_year, parent_name, phone, email, notes, locale)
       SELECT a.id, a.discipline_id, $2, $3, $4, $5, $6, $7, $8
       FROM academy_programs a JOIN disciplines d ON d.id = a.discipline_id
       WHERE a.slug = $1 AND a.is_published AND d.is_published
       RETURNING id`,
      [d.program, d.child_name, birthYear, d.parent_name, d.phone, d.email, [`Datëlindja: ${d.birth_date}`, d.experience].filter(Boolean).join("\n"), d.locale],
    );
    return application ? { status: "done" } : { status: "error", message: "invalid" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "server" };
  }
}

const Message = z.object({
  name: text(120),
  email: z.string().trim().email().max(160),
  subject: optional(200),
  message: text(5000),
  locale,
});

export async function submitMessage(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) return { status: "done" };
  const parsed = Message.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "invalid" };
  const d = parsed.data;
  try {
    if (!(await allowed("contact"))) return { status: "error", message: "limit" };
    await query(
      "INSERT INTO contact_messages (name, email, subject, message, locale) VALUES ($1, $2, $3, $4, $5)",
      [d.name, d.email, d.subject, d.message, d.locale],
    );
    return { status: "done" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "server" };
  }
}
