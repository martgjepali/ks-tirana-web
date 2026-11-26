"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

/**
 * Academy registration form from the client's final design (page 25).
 * Submission is not wired to the server yet (Phase 6 in docs/PLAN.md): it shows
 * the confirmation only.
 */
export function AcademyForm({
  dict,
  programs,
  defaultProgram,
}: {
  dict: Dictionary;
  programs: { slug: string; name: string }[];
  defaultProgram?: string;
}) {
  const f = dict.academy.apply;
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    window.setTimeout(() => setStatus("done"), 700);
  }

  if (status === "done") {
    return (
      <div className="bg-card p-8 text-center">
        <p className="text-lg font-bold text-strong">{f.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold text-strong">{f.athlete}</h2>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <Field label={f.name} required>
          <input name="child_name" required type="text" autoComplete="name" placeholder={f.namePlaceholder} className="field" />
        </Field>
        <Field label={f.birth} required>
          <input name="birth_date" required type="date" className="field" />
        </Field>
        <Field label={f.program} required>
          <select name="program" required defaultValue={defaultProgram ?? ""} className="field">
            <option value="" disabled>
              {f.programPlaceholder}
            </option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={f.experience}>
          <input name="experience" type="text" placeholder={f.experiencePlaceholder} className="field" />
        </Field>
      </div>

      <h2 className="mt-8 text-2xl font-extrabold text-strong">{f.contact}</h2>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={f.contactName} required>
            <input name="parent_name" required type="text" autoComplete="name" placeholder={f.namePlaceholder} className="field" />
          </Field>
        </div>
        <Field label={f.phone} required>
          <input name="phone" required type="tel" autoComplete="tel" placeholder={f.phonePlaceholder} className="field" />
        </Field>
        <Field label={f.email} required>
          <input name="email" required type="email" autoComplete="email" placeholder={f.emailPlaceholder} className="field" />
        </Field>
      </div>

      <button type="submit" disabled={status === "submitting"} className="btn btn-primary mt-7 min-w-56 !justify-start !text-base !normal-case !tracking-normal">
        {status === "submitting" ? f.submitting : f.submit}
      </button>
      <p className="mt-4 text-xs text-ink/60">{f.required}</p>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-strong">
        {label}
        {required && " *"}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
