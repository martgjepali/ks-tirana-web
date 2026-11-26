import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireStaff } from "@/lib/admin/session";
import { query } from "@/lib/db/pool";
import { AdminNav } from "@/components/admin/AdminNav";
import { Icon } from "@/components/Icons";

async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/hyrje");
}

/** Staff-only area: everything below requires a signed-in account. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const [counts] = await query<{ applications: number; messages: number }>(
    `SELECT (SELECT count(*) FROM academy_applications WHERE status = 'new')::int AS applications,
            (SELECT count(*) FROM contact_messages WHERE status = 'new')::int AS messages`,
  );

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="admin-header sticky top-0 z-20 bg-navy-900 text-white lg:h-dvh lg:overflow-y-auto">
        <div className="admin-header-content flex items-center justify-between gap-3 lg:px-5 lg:py-5">
          <Link href="/admin" className="flex min-h-11 items-center gap-2.5">
            <Image src="/images/ks-tirana-crest.png" alt="" width={32} height={40} className="h-8 w-auto shrink-0 lg:h-9" />
            <span>
              <span className="block text-sm font-extrabold leading-none lg:text-lg">KS TIRANA</span>
              <span className="hidden text-xs text-white/65 lg:inline">Paneli i stafit</span>
            </span>
          </Link>
          <Link href="/sq" target="_blank" rel="noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm text-xs font-semibold text-sky-300 hover:underline active:bg-white/10 lg:min-w-0">
            <Icon name="external" className="h-5 w-5 shrink-0 lg:h-4 lg:w-4" />
            <span className="sr-only lg:not-sr-only">Shiko faqen</span>
          </Link>
        </div>
        <AdminNav badges={{ "/admin/aplikimet": counts.applications, "/admin/mesazhet": counts.messages }} staff={{ name: user.name, email: user.email }} signOut={signOut} />
      </aside>
      <main className="admin-main min-w-0 pt-5 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
