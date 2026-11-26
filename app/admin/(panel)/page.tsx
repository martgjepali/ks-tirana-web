import Link from "next/link";
import { requireStaff } from "@/lib/admin/session";
import { query } from "@/lib/db/pool";
import { Card, PageHeader, Table, Badge } from "@/components/admin/ui";
import { Icon } from "@/components/Icons";
import { APPLICATION_STATUSES, MESSAGE_STATUSES } from "@/lib/admin/sections";

const stats = [
  { key: "disciplines", label: "Disiplina", short: "Disiplina", href: "disiplinat", icon: "trophy" },
  { key: "people", label: "Sportistë dhe staf", short: "Persona", href: "personat", icon: "users" },
  { key: "photos", label: "Foto", short: "Foto", href: "fotot", icon: "camera" },
  { key: "news", label: "Lajme", short: "Lajme", href: "lajme", icon: "news" },
  { key: "fixtures", label: "Ndeshje", short: "Ndeshje", href: "ndeshjet", icon: "calendar" },
  { key: "applications", label: "Aplikime të reja", short: "Aplikime", href: "aplikimet?status=new", icon: "check" },
  { key: "messages", label: "Mesazhe të reja", short: "Mesazhe", href: "mesazhet?status=new", icon: "mail" },
] as const;

type InboxRow = { id: number; name: string; status: string; created_at: Date };
const date = new Intl.DateTimeFormat("sq-AL", { dateStyle: "medium", timeZone: "Europe/Tirane" });

export default async function Dashboard() {
  await requireStaff();
  const [[totals], applications, messages] = await Promise.all([
    query<Record<(typeof stats)[number]["key"], number>>(
      `SELECT (SELECT count(*) FROM disciplines)::int AS disciplines,
              (SELECT count(*) FROM people)::int AS people,
              (SELECT count(*) FROM photos)::int AS photos,
              (SELECT count(*) FROM news)::int AS news,
              (SELECT count(*) FROM fixtures)::int AS fixtures,
              (SELECT count(*) FROM academy_applications WHERE status = 'new')::int AS applications,
              (SELECT count(*) FROM contact_messages WHERE status = 'new')::int AS messages`,
    ),
    query<InboxRow>("SELECT id, child_name AS name, status, created_at FROM academy_applications ORDER BY created_at DESC, id DESC LIMIT 5"),
    query<InboxRow>("SELECT id, name, status, created_at FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 5"),
  ]);
  const inboxes = [
    { title: "Aplikimet e fundit", route: "/admin/aplikimet", rows: applications, options: APPLICATION_STATUSES },
    { title: "Mesazhet e fundit", route: "/admin/mesazhet", rows: messages, options: MESSAGE_STATUSES },
  ];
  return (
    <>
      <PageHeader title="Paneli" />
      <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4 lg:rounded-none 2xl:grid-cols-7">
        {stats.map(({ key, label, short, href, icon }) => (
          <Link key={key} href={`/admin/${href}`} aria-label={`${label} · ${totals[key]}`} className="flex min-h-12 min-w-0 items-center gap-1.5 bg-white px-2.5 py-2 hover:bg-surface active:bg-surface-2 max-sm:last:col-span-2 sm:flex-col sm:items-start sm:gap-1 sm:px-4 sm:py-3">
            <Icon name={icon} className="h-4 w-4 shrink-0 text-blue-600 sm:hidden" />
            <span className="grow text-[0.75rem] font-medium text-ink/75 sm:text-sm"><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{label}</span></span>
            <span className="text-lg font-extrabold tabular-nums text-strong sm:text-2xl">{totals[key]}</span>
          </Link>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {inboxes.map(({ title, route, rows, options }) => (
          <Card key={route} title={title} aside={<Link href={route} aria-label={`${title} · Shiko të gjitha`} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-sm font-semibold text-blue-500 hover:underline active:bg-surface">
            <Icon name="arrowRight" className="h-5 w-5 sm:hidden" /><span className="hidden sm:inline">Shiko të gjitha</span>
          </Link>}>
            <Table head={["Emri", "Data", "Statusi"]} compact mobileColumns={["calendar", "value"]} rows={rows.map((row) => ({
              id: row.id,
              href: `${route}/${row.id}`,
              title: row.name,
              details: [
                date.format(row.created_at),
                <Badge key="status" tone={row.status === "new" ? "blue" : "gray"}>{options.find((o) => o.value === row.status)?.label ?? row.status}</Badge>,
              ],
            }))} />
          </Card>
        ))}
      </div>
    </>
  );
}
