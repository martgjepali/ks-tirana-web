import { notFound, redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/session";
import { query } from "@/lib/db/pool";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { createStaff, deleteStaff, resetStaff } from "../actions";
import { PasswordForm } from "../password-form";

type Search = Record<string, string | string[] | undefined>;

export default async function StaffEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  const current = await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (id === current.id) redirect("/admin/perdoruesit/une");
  const isNew = id === "i-ri";
  const [staff] = isNew ? [] : await query<{ name: string; email: string }>('SELECT name, email FROM "user" WHERE id = $1', [id]);
  if (!isNew && !staff) notFound();
  return (
    <>
      <PageHeader title={staff?.name ?? "Shto përdorues"} subtitle={staff?.email} back={{ href: "/admin/perdoruesit", label: "Përdoruesit" }} />
      <Notice ok={sp.ok} error={sp.gabim} />
      <div className="max-w-3xl space-y-5">
        <Card title={staff ? "Fjalëkalimi" : undefined}>
          <PasswordForm action={staff ? resetStaff.bind(null, id) : createStaff} reset={!!staff} />
        </Card>
        {staff && <form action={deleteStaff.bind(null, id)}><ConfirmButton>Fshi përdoruesin</ConfirmButton></form>}
      </div>
    </>
  );
}
