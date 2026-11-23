"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function AcademyForm({ dict }: { dict: Dictionary }) {
  const f = dict.academy.form;
  const sports = dict.home.sports.items.map((s) => s.name);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">(
    "idle"
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    window.setTimeout(() => setStatus("done"), 700);
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-8 text-center">
        <p className="font-display text-lg font-semibold text-navy-900">
          {f.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label={f.childName} required>
        <input
          required
          type="text"
          placeholder={f.childNamePlaceholder}
          className="field"
        />
      </Field>
      <Field label={f.birthYear} required>
        <input
          required
          type="number"
          min={2007}
          max={2020}
          placeholder="2015"
          className="field"
        />
      </Field>
      <Field label={f.sport} required>
        <select required defaultValue="" className="field">
          <option value="" disabled>
            {f.sportPlaceholder}
          </option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field label={f.parentName} required>
        <input
          required
          type="text"
          placeholder={f.parentNamePlaceholder}
          className="field"
        />
      </Field>
      <Field label={f.phone} required>
        <input
          required
          type="tel"
          placeholder={f.phonePlaceholder}
          className="field"
        />
      </Field>
      <Field label={f.email} required>
        <input
          required
          type="email"
          placeholder={f.emailPlaceholder}
          className="field"
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label={f.notes}>
          <textarea
            rows={4}
            placeholder={f.notesPlaceholder}
            className="field resize-none"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn btn-primary w-full sm:w-auto"
        >
          {status === "submitting" ? f.submitting : f.submit}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">
        {label}
        {required && <span className="text-blue-500"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
