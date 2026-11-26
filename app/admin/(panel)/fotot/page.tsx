import Image from "next/image";
import Link from "next/link";
import { recordId } from "@/lib/admin/form";
import { disciplineOptions, thumbOf } from "@/lib/admin/lookups";
import { requireStaff } from "@/lib/admin/session";
import { query } from "@/lib/db/pool";
import { MultiUpload } from "@/components/admin/client";
import { Badge, Card, Field, FilterButton, LinkButton, Notice, one, PageHeader, Select } from "@/components/admin/ui";
import { Icon } from "@/components/Icons";
import { uploadPhoto } from "./actions";

type Search = Record<string, string | string[] | undefined>;
type Photo = { id: string; storage_key: string; label: string; is_published: boolean; is_featured: boolean };
const PAGE_SIZE = 36;
const base = "/admin/fotot";

export default async function PhotosPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireStaff();
  const sp = await searchParams;
  const disciplines = await disciplineOptions();
  const wanted = recordId(one(sp.disiplina) ?? "");
  const discipline = disciplines.find((item) => item.value === wanted);
  const page = recordId(one(sp.faqja) ?? "") ?? 1;
  const rows = await query<Photo>(
    `SELECT p.id, p.storage_key, p.is_published, p.is_featured, coalesce(p.alt_sq, d.name_sq, 'Foto e klubit') AS label
     FROM photos p LEFT JOIN disciplines d ON d.id = p.discipline_id
     WHERE ($1::int IS NULL OR p.discipline_id = $1)
     ORDER BY p.created_at DESC, p.id LIMIT $2 OFFSET $3`,
    [discipline?.value ?? null, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE],
  );
  const pageLink = (number: number) => `${base}?faqja=${number}${discipline ? `&disiplina=${discipline.value}` : ""}`;
  return (
    <>
      <PageHeader title="Fotot" />
      <Notice ok={sp.ok} error={sp.gabim} />
      <Card className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <form action={base} className="flex w-full items-end gap-2 sm:w-auto sm:gap-3">
            <Field label="Disiplina" className="flex-1"><Select name="disiplina" defaultValue={discipline?.value ?? ""} options={[{ value: "", label: "Të gjitha" }, ...disciplines]} /></Field>
            <FilterButton />
          </form>
          <div className="space-y-2">
            <p className="text-sm text-ink/65">{discipline ? `Ngarko te ${discipline.label}` : "Ngarko pa disiplinë"}</p>
            <MultiUpload key={discipline?.value ?? "all"} upload={uploadPhoto.bind(null, discipline?.value ?? null)} />
          </div>
        </div>
      </Card>
      {rows.length === 0 && <p className="py-8 text-center text-sm text-ink/65">Nuk ka foto në këtë faqe.</p>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
        {rows.slice(0, PAGE_SIZE).map((photo) => (
          <li key={photo.id} className="min-w-0">
            <Link href={`${base}/${photo.id}`} className="block overflow-hidden rounded-lg border border-line bg-white hover:border-blue-500 active:bg-surface-2 lg:rounded-none">
              <Image src={thumbOf(photo.storage_key)} alt="" width={320} height={240} className="aspect-[4/3] w-full object-cover" unoptimized />
              <div className="space-y-2 p-2.5">
                <p className="truncate text-sm font-bold" title={photo.label}>{photo.label}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge tone={photo.is_published ? "green" : "gray"}>{photo.is_published ? "Publikuar" : "E fshehur"}</Badge>
                  {photo.is_featured && <Badge tone="blue"><Icon name="trophy" className="inline h-3.5 w-3.5 sm:hidden" /><span className="sr-only sm:not-sr-only">E përzgjedhur</span></Badge>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {(page > 1 || rows.length > PAGE_SIZE) && (
        <nav aria-label="Faqet e fotove" className="mt-5 flex flex-wrap items-center gap-3">
          {page > 1 && <LinkButton href={pageLink(page - 1)} variant="ghost" icon="arrowLeft" compact>Më parë</LinkButton>}
          <span className="text-sm">Faqja {page}</span>
          {rows.length > PAGE_SIZE && <LinkButton href={pageLink(page + 1)} variant="ghost" icon="arrowRight" compact>Më tej</LinkButton>}
        </nav>
      )}
    </>
  );
}
