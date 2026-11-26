"use client";

import { useActionState } from "react";
import { submitMessage, type FormState } from "@/app/actions/forms";
import type { Dictionary } from "@/app/[lang]/dictionaries";

/**
 * Contact form from the client's final design (page 31). Saved to the database;
 * staff see it in /admin → Mesazhet.
 */
export function ContactForm({ dict, lang, defaultSubject }: { dict: Dictionary; lang: string; defaultSubject?: string }) {
  const f = dict.contact.form;
  const [state, action, pending] = useActionState<FormState, FormData>(submitMessage, { status: "idle" });

  if (state.status === "done") {
    return (
      <div className="bg-card p-8 text-center">
        <p className="text-lg font-bold text-strong">{f.success}</p>
      </div>
    );
  }

  const label = "text-sm font-bold text-strong";
  return (
    <form action={action} className="relative grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {/* Spam trap: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input type="hidden" name="locale" value={lang} />
      {state.status === "error" && state.message && (
        <p role="alert" className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 sm:col-span-2">
          {dict.formErrors[state.message]}
        </p>
      )}
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
        <button type="submit" disabled={pending} className="btn btn-primary min-w-56 !justify-start !text-base !normal-case !tracking-normal">
          {pending ? f.submitting : f.submit}
        </button>
        <p className="mt-4 text-xs text-ink/60">{f.required}</p>
      </div>
    </form>
  );
}
