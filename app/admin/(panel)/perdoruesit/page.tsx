import { requireStaff } from "@/lib/admin/session";
import { query } from "@/lib/db/pool";
import { Badge, LinkButton, Notice, PageHeader, Table } from "@/components/admin/ui";

type Search = Record<string, string | string[] | undefined>;

export default async function StaffList({ searchParams }: { searchParams: Promise<Search> }) {
  const current = await requireStaff();
  const [sp, users] = await Promise.all([searchParams, query<{ id: string; name: string; email: string }>('SELECT id, name, email FROM "user" ORDER BY name, id')]);
  return (
    <>
      <PageHeader title="Përdoruesit" actions={<><LinkButton href="/admin/perdoruesit/une" variant="ghost" icon="key" compact>Fjalëkalimi im</LinkButton><LinkButton href="/admin/perdoruesit/i-ri" icon="plus" compact>Shto përdorues</LinkButton></>} />
      <Notice ok={sp.ok} error={sp.gabim} />
      <Table head={["Emri", "Email"]} compact mobileColumns={["mail"]} rows={users.map((user) => ({
        id: user.id,
        href: user.id === current.id ? "/admin/perdoruesit/une" : `/admin/perdoruesit/${encodeURIComponent(user.id)}`,
        title: <>{user.name}{user.id === current.id && <span className="ml-2"><Badge tone="gray">Ju</Badge></span>}</>,
        details: [user.email],
      }))} />
    </>
  );
}
