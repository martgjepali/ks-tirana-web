import Image from "next/image";
import { query } from "@/lib/db/pool";
import { Card } from "@/components/admin/ui";
import { ConfirmButton, MultiUpload, SubmitButton } from "@/components/admin/client";
import { editMagazinePage, uploadMagazinePage } from "./magazine-actions";

export async function MagazinePages({ id }: { id: number }) {
  const pages = await query<{ id: number; image_url: string }>("SELECT id, image_url FROM magazine_pages WHERE issue_id = $1 ORDER BY sort_order, id", [id]);
  return (
    <div id="faqet">
      <Card title="Faqet e revistës">
        <MultiUpload upload={uploadMagazinePage.bind(null, id)} label="Ngarko faqet" maxEdge={2200} />
        {pages.length === 0 && <p className="mt-4 text-sm text-ink/65">Nuk ka ende faqe.</p>}
        <ol className="mt-4 divide-y divide-line">
          {pages.map((page, i) => (
            <li key={page.id} className="flex flex-wrap items-center gap-2 py-3 sm:gap-3">
              <Image src={page.image_url} width={56} height={76} alt="" className="h-14 w-10 shrink-0 object-contain sm:h-[76px] sm:w-14" unoptimized />
              <span className="grow text-sm font-semibold sm:text-base">Faqja {i + 1}</span>
              <div className="flex items-center gap-1 sm:gap-2">
                {i > 0 && <form action={editMagazinePage.bind(null, id, page.id, "up")}><SubmitButton variant="ghost" icon="chevronDown" iconClassName="rotate-180" compact>Lart</SubmitButton></form>}
                {i < pages.length - 1 && <form action={editMagazinePage.bind(null, id, page.id, "down")}><SubmitButton variant="ghost" icon="chevronDown" compact>Poshtë</SubmitButton></form>}
                <form action={editMagazinePage.bind(null, id, page.id, "delete")}><ConfirmButton compact>Fshi faqen</ConfirmButton></form>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
