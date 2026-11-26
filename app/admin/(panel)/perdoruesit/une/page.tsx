import { requireStaff } from "@/lib/admin/session";
import { Card, Field, Input, Notice, PageHeader } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/client";
import { changeOwnPassword } from "../actions";

type Search = Record<string, string | string[] | undefined>;

export default async function OwnPassword({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireStaff();
  const sp = await searchParams;
  return (
    <>
      <PageHeader title="Fjalëkalimi im" subtitle={user.email} back={{ href: "/admin/perdoruesit", label: "Përdoruesit" }} />
      <Notice ok={sp.ok} error={sp.gabim} />
      <Card className="max-w-lg">
        <form action={changeOwnPassword} className="space-y-4">
          <Field label="Fjalëkalimi aktual"><Input name="current_password" type="password" autoComplete="current-password" required /></Field>
          <Field label="Fjalëkalimi i ri" hint="Të paktën 10 karaktere."><Input name="new_password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /></Field>
          <Field label="Përsërit fjalëkalimin e ri"><Input name="confirm_password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /></Field>
          <SubmitButton>Ndrysho fjalëkalimin</SubmitButton>
        </form>
      </Card>
    </>
  );
}
