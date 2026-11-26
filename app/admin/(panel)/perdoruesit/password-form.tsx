"use client";

import { useActionState } from "react";
import { Field, Grid, Input, Notice, Check } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";
import type { PasswordResult } from "./actions";

export function PasswordForm({ action, reset }: { action: (state: PasswordResult, form: FormData) => Promise<PasswordResult>; reset?: boolean }) {
  const [result, submit] = useActionState(action, {});
  return (
    <form action={submit} className="space-y-4">
      <Notice error={result.error} />
      {result.password && (
        <div role="status" className="space-y-2 border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-bold">Fjalëkalimi i përkohshëm</p>
          <output className="select-all break-all font-mono text-base font-bold">{result.password}</output>
          <p>Kopjojeni tani dhe ndajeni në mënyrë të sigurt me përdoruesin. Pas hyrjes, përdoruesi mund ta ndryshojë te Fjalëkalimi.</p>
        </div>
      )}
      {reset ? <Check name="confirm" label="Mbyll seancat e këtij përdoruesi dhe krijo një fjalëkalim të ri." /> : (
        <Grid>
          <Field label="Emri"><Input name="name" autoComplete="off" required maxLength={120} /></Field>
          <Field label="Email"><Input name="email" type="email" autoComplete="off" required maxLength={254} /></Field>
        </Grid>
      )}
      <SubmitButton>{reset ? "Rivendos fjalëkalimin" : "Krijo përdoruesin"}</SubmitButton>
    </form>
  );
}
