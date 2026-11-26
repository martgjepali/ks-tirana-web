"use client";

import { useActionState, type ReactNode } from "react";
import { submitApplication, type FormState } from "@/app/actions/forms";
import type { Dictionary } from "@/app/[lang]/dictionaries";

/**
 * Academy registration form from the client's final design (page 25).
 * Saved to the database; staff see it in /admin → Aplikimet.
 */
export function AcademyForm({
  dict,
  lang,
  programs,
  defaultProgram,
}: {
  dict: Dictionary;
  lang: string;
  programs: { slug: string; name: string }[];
  defaultProgram?: string;
}) {
  const f = dict.academy.apply;
  const [state, action, pending] = useActionState<FormState, FormData>(submitApplication, { status: "idle" });

  if (state.status === "done") {
    return (
      <div className="bg-card p-8 text-center">
        <p className="text-lg font-bold text-strong">{f.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative">
      {/* Spam trap: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input type="hidden" name="locale" value={lang} />
      {state.status === "error" && state.message && (
        <p role="alert" className="mb-5 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {dict.formErrors[state.message]}
        </p>
      )}
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

      <button type="submit" disabled={pending} className="btn btn-primary mt-7 min-w-56 !justify-start !text-base !normal-case !tracking-normal">
        {pending ? f.submitting : f.submit}
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
