import Link from "next/link";
import { requireStaff } from "@/lib/admin/session";
import { PageHeader } from "@/components/admin/ui";
import { TEXT_SECTIONS } from "./sections";

export default async function TextSections() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Tekstet e faqeve" subtitle="Zgjidhni pjesën e faqes që dëshironi të përditësoni." />
      <ul className="grid max-w-5xl grid-cols-1 divide-line border border-line bg-white sm:grid-cols-2">
        {Object.entries(TEXT_SECTIONS).map(([key, label]) => (
          <li key={key} className="border-b border-r border-line">
            <Link href={`/admin/tekstet/${key}`} className="block px-4 py-3 text-sm font-bold text-blue-500 hover:bg-surface hover:underline">{label}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
