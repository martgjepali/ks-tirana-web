"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function ContactForm({ dict }: { dict: Dictionary }) {
  const f = dict.contact.form;
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
      <label className="block">
        <span className="text-sm font-medium text-ink/80">{f.name} *</span>
        <input
          required
          type="text"
          placeholder={f.namePlaceholder}
          className="field mt-1.5"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink/80">{f.email} *</span>
        <input
          required
          type="email"
          placeholder={f.emailPlaceholder}
          className="field mt-1.5"
        />
      </label>
      <div className="sm:col-span-2">
        <label className="block">
          <span className="text-sm font-medium text-ink/80">{f.subject}</span>
          <input
            type="text"
            placeholder={f.subjectPlaceholder}
            className="field mt-1.5"
          />
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="block">
          <span className="text-sm font-medium text-ink/80">{f.message} *</span>
          <textarea
            required
            rows={5}
            placeholder={f.messagePlaceholder}
            className="field mt-1.5 resize-none"
          />
        </label>
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
