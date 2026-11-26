"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

/**
 * Contact form from the client's final design (page 31). Submission is not wired
 * to the server yet (Phase 6 in docs/PLAN.md): it shows the confirmation only.
 */
export function ContactForm({ dict, defaultSubject }: { dict: Dictionary; defaultSubject?: string }) {
  const f = dict.contact.form;
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

  const label = "text-sm font-bold text-strong";
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <label className="block">
        <span className={label}>{f.name} *</span>
        <input name="name" required type="text" autoComplete="name" placeholder={f.namePlaceholder} className="field mt-1.5" />
      </label>
      <label className="block">
        <span className={label}>{f.email} *</span>
        <input name="email" required type="email" autoComplete="email" placeholder={f.emailPlaceholder} className="field mt-1.5" />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>{f.subject} *</span>
        <input name="subject" required type="text" defaultValue={defaultSubject} placeholder={f.subjectPlaceholder} className="field mt-1.5" />
      </label>
      <label className="block sm:col-span-2">
        <span className={label}>{f.message} *</span>
        <textarea name="message" required rows={5} placeholder={f.messagePlaceholder} className="field mt-1.5 resize-none" />
      </label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "submitting"} className="btn btn-primary min-w-56 !justify-start !text-base !normal-case !tracking-normal">
          {status === "submitting" ? f.submitting : f.submit}
        </button>
        <p className="mt-4 text-xs text-ink/60">{f.required}</p>
      </div>
    </form>
  );
}
