import Image from "next/image";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/session";
import { isPhotoId } from "@/lib/admin/form";
import { disciplineOptions, thumbOf } from "@/lib/admin/lookups";
import { query } from "@/lib/db/pool";
import { Bilingual, Card, Check, Field, Grid, Notice, PageHeader, Select } from "@/components/admin/ui";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { deletePhoto, editPhoto } from "../actions";

type Search = Record<string, string | string[] | undefined>;
type Photo = { storage_key: string; discipline_id: number | null; alt_sq: string | null; alt_en: string | null; is_featured: boolean; is_published: boolean };
type Person = { id: number; full_name: string; discipline_id: number; tagged: boolean };

export default async function PhotoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!isPhotoId(id)) notFound();
  const [[photo], disciplines, people] = await Promise.all([
    query<Photo>("SELECT * FROM photos WHERE id = $1", [id]),
    disciplineOptions(),
    query<Person>(
      `SELECT p.id, p.full_name, p.discipline_id, (tag.person_id IS NOT NULL) AS tagged
       FROM people p LEFT JOIN photo_people tag ON tag.person_id = p.id AND tag.photo_id = $1
       ORDER BY p.full_name`, [id],
    ),
  ]);
  if (!photo) notFound();
  return (
    <>
      <PageHeader title="Ndrysho foton" back={{ href: "/admin/fotot", label: "Fotot" }} />
      <Notice ok={sp.ok} error={sp.gabim} />
      <div className="max-w-5xl space-y-5">
        <Card>
          <Image src={thumbOf(photo.storage_key, "md")} alt={photo.alt_sq ?? ""} width={640} height={480} className="mb-5 max-h-96 w-auto object-contain" unoptimized />
          <form action={editPhoto.bind(null, id)} className="space-y-5">
            <Grid>
              <Bilingual name="alt" label="Përshkrimi i imazhit" values={{ sq: photo.alt_sq, en: photo.alt_en }} />
              <Field label="Disiplina"><Select name="discipline_id" defaultValue={photo.discipline_id ?? ""} options={[{ value: "", label: "Pa disiplinë" }, ...disciplines]} /></Field>
              <div className="space-y-1">
                <Check name="is_featured" label="E përzgjedhur" defaultChecked={photo.is_featured} />
                <Check name="is_published" label="Publikuar" defaultChecked={photo.is_published} />
              </div>
            </Grid>
            <fieldset>
              <legend className="font-bold text-strong">Personat në foto</legend>
              <div className="mt-2 max-h-80 space-y-2 overflow-y-auto border border-line p-4">
                {disciplines.map((discipline) => {
                  const members = people.filter((person) => person.discipline_id === discipline.value);
                  if (members.length === 0) return null;
                  return (
                    <details key={discipline.value} open={photo.discipline_id === discipline.value || members.some((person) => person.tagged)}>
                      <summary className="cursor-pointer py-1 text-sm font-bold">{discipline.label}</summary>
                      <div className="grid gap-x-4 py-1 sm:grid-cols-2">
                        {members.map((person) => (
                          <label key={person.id} className="flex items-center gap-2 py-1 text-sm">
                            <input type="checkbox" name="person_id" value={person.id} defaultChecked={person.tagged} className="h-4 w-4 shrink-0 accent-[#0057d8]" />
                            {person.full_name}
                          </label>
                        ))}
                      </div>
                    </details>
                  );
                })}
                {people.length === 0 && <p className="text-sm text-ink/65">Nuk ka ende persona.</p>}
              </div>
            </fieldset>
            <SubmitButton>Ruaj</SubmitButton>
          </form>
        </Card>
        <form action={deletePhoto.bind(null, id)}><ConfirmButton>Fshi foton</ConfirmButton></form>
      </div>
    </>
  );
}
