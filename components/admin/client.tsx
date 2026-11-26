"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/Icons";

/* Interactive admin pieces: submit buttons, confirmations, image inputs, photo library. */

export function SubmitButton({ children, variant = "primary", name, value, icon, compact = false, iconClassName = "" }: {
  children: ReactNode; variant?: "primary" | "danger" | "ghost"; name?: string; value?: string;
  icon?: IconName; compact?: boolean; iconClassName?: string;
}) {
  const { pending } = useFormStatus();
  const cls = variant === "danger" ? "bg-red-600 text-white hover:bg-red-700" : variant === "ghost" ? "btn-ghost" : "btn-primary";
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-busy={pending} className={`btn ${cls} !py-2.5 disabled:opacity-60 ${compact ? "min-h-11 min-w-11 !px-0 sm:!px-3" : ""}`}>
      {icon && <Icon name={icon} className={`h-5 w-5 shrink-0 ${iconClassName}`} />}
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{pending ? "Duke ruajtur…" : children}</span>
    </button>
  );
}

/** A submit button that asks first ("A jeni i sigurt?"). Use inside its own <form action={deleteAction}>. */
export function ConfirmButton({ children, question = "A jeni i sigurt? Ky veprim nuk kthehet mbrapsht.", compact = false, icon = "trash" }: { children: ReactNode; question?: string; compact?: boolean; icon?: IconName }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
      className={`btn !py-2.5 border border-red-300 bg-white text-red-700 hover:bg-red-50 disabled:opacity-60 ${compact ? "min-h-11 min-w-11 !px-0 sm:!px-3" : ""}`}
    >
      <Icon name={icon} className="h-5 w-5 shrink-0" />
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{children}</span>
    </button>
  );
}

/**
 * Downscales a photo in the browser before upload, so phone pictures (5–10 MB)
 * stay under the server's 4 MB limit. PNGs with transparency (logos) stay PNG.
 */
async function shrink(file: File, maxEdge: number): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  try {
    if (scale === 1 && file.size < 3.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, type === "image/png" ? ".png" : ".jpg"), { type });
  } finally {
    bitmap.close();
  }
}

/** File input with preview; photos are shrunk in the browser before the form is sent. */
export function ImageInput({
  name,
  current,
  maxEdge = 2400,
  accept = "image/*",
  label = "Zgjidh imazhin",
  contain,
}: {
  name: string;
  current?: string | null;
  maxEdge?: number;
  accept?: string;
  label?: string;
  /** Show the whole image (logos) instead of cropping (photos). */
  contain?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [busy, setBusy] = useState(false);
  const isPdf = accept.includes("pdf");

  useEffect(() => {
    if (!preview?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    const form = input.current?.form;
    if (!form || !busy) return;
    const preventSubmit = (event: SubmitEvent) => event.preventDefault();
    form.addEventListener("submit", preventSubmit);
    return () => form.removeEventListener("submit", preventSubmit);
  }, [busy]);

  return (
    <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
      {!isPdf && (
        <div className={`flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden border border-line ${contain ? "bg-white" : "bg-surface"}`}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview / stored file
            <img src={preview} alt="" className={`h-full w-full ${contain ? "object-contain p-2" : "object-cover"}`} />
          ) : (
            <Icon name="camera" className="h-7 w-7 text-ink/30" />
          )}
        </div>
      )}
      <div className="w-full min-w-0 sm:w-auto">
        <input
          ref={input}
          type="file"
          name={name}
          accept={accept}
          aria-label={label}
          className="block w-full text-sm file:mr-2 file:cursor-pointer file:rounded-sm file:border-0 file:bg-blue-500 file:px-2.5 file:py-2 file:text-sm file:font-semibold file:text-white"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || isPdf) {
              setPreview(current ?? null);
              setBusy(false);
              return;
            }
            setBusy(true);
            const small = await shrink(file, maxEdge).catch(() => file);
            if (input.current?.files?.[0] !== file) return;
            if (small !== file) {
              const dt = new DataTransfer();
              dt.items.add(small);
              input.current.files = dt.files;
            }
            setPreview(URL.createObjectURL(small));
            setBusy(false);
          }}
        />
        <p className="mt-1 text-xs text-ink/60" aria-live="polite">{busy ? "Duke përgatitur imazhin…" : `${label} (deri në 4 MB).`}</p>
        {isPdf && current && (
          <a href={current} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-blue-500 underline">
            Skedari aktual
          </a>
        )}
      </div>
    </div>
  );
}

export type LibraryPhoto = { id: string; thumb: string; label: string };

/**
 * Pick a photo from the library (or keep / clear the current one). The chosen
 * id goes in a hidden input `name`; an upload in the same form wins over it.
 */
export function PhotoPicker({
  name,
  current,
  load,
}: {
  name: string;
  current: { id: string; thumb: string } | null;
  load: (search: string, page: number) => Promise<LibraryPhoto[]>;
}) {
  const [chosen, setChosen] = useState(current);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [photos, setPhotos] = useState<LibraryPhoto[]>([]);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    start(async () => {
      try {
        const results = await load(search, page);
        if (active) {
          setPhotos(results);
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    });
    return () => { active = false; };
  }, [open, search, page, load]);

  useEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) el.showModal();
    if (!open && el?.open) el.close();
  }, [open]);

  return (
    <div>
      <input type="hidden" name={name} value={chosen?.id ?? ""} />
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-surface sm:h-24 sm:w-32">
          {chosen ? (
            // eslint-disable-next-line @next/next/no-img-element -- stored thumbnail
            <img src={chosen.thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name="camera" className="h-7 w-7 text-ink/30" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost min-h-11 min-w-11 !px-2 !py-2 sm:!px-3">
            <Icon name="camera" className="h-5 w-5" />
            <span className="sm:hidden" aria-hidden="true">Zgjidh</span>
            <span className="sr-only sm:not-sr-only">Zgjidh nga fotot</span>
          </button>
          {chosen && (
            <button type="button" onClick={() => setChosen(null)} className="btn btn-ghost min-h-11 min-w-11 !px-2 !py-2 text-red-700 sm:!px-3">
              <Icon name="close" className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only">Hiq foton</span>
            </button>
          )}
        </div>
      </div>

      <dialog aria-label="Biblioteka e fotove" ref={dialog} onClose={() => setOpen(false)} className="m-auto w-[min(56rem,94vw)] max-w-none rounded-xl p-0 backdrop:bg-black/60">
        <div className="flex items-center gap-2 border-b border-line p-3 sm:gap-3 sm:p-4">
          <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost order-last min-h-11 min-w-11 !px-0 !py-2" aria-label="Mbyll">
            <Icon name="close" className="h-5 w-5" />
          </button>
          <input
            type="search"
            aria-label="Kërko foto"
            placeholder="Disiplinë ose person…"
            enterKeyHint="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="field min-w-0 flex-1"
          />
        </div>
        <div className="max-h-[min(60dvh,calc(100dvh_-_8rem))] min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4">
          {pending && photos.length === 0 ? (
            <p className="py-10 text-center text-ink/55">Duke ngarkuar…</p>
          ) : failed ? (
            <p role="alert" className="py-10 text-center text-red-700">Fotot nuk u ngarkuan. Mbylleni bibliotekën dhe provoni përsëri.</p>
          ) : photos.length === 0 ? (
            <p className="py-10 text-center text-ink/55">Asnjë foto.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photos.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    title={p.label}
                    onClick={() => {
                      setChosen({ id: p.id, thumb: p.thumb });
                      setOpen(false);
                    }}
                    className={`block aspect-[4/3] w-full overflow-hidden ring-blue-500 hover:ring-4 ${chosen?.id === p.id ? "ring-4" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- stored thumbnail */}
                    <img src={p.thumb} alt={p.label} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-between border-t border-line p-3">
          <button type="button" disabled={page === 0 || pending} onClick={() => setPage((p) => p - 1)} className="btn btn-ghost min-h-11 min-w-11 !px-2 !py-2 disabled:opacity-40 sm:!px-3">
            <Icon name="arrowLeft" className="h-5 w-5" /><span className="sr-only sm:not-sr-only">Më parë</span>
          </button>
          <button type="button" disabled={photos.length < 30 || pending} onClick={() => setPage((p) => p + 1)} className="btn btn-ghost min-h-11 min-w-11 !px-2 !py-2 disabled:opacity-40 sm:!px-3">
            <Icon name="arrowRight" className="h-5 w-5" /><span className="sr-only sm:not-sr-only">Më tej</span>
          </button>
        </div>
      </dialog>
    </div>
  );
}

/**
 * Uploads several files one by one (each request stays under the size limit),
 * then refreshes the page. `upload` is a Server Action taking FormData with "file".
 */
export function MultiUpload({
  upload,
  extra,
  maxEdge = 2400,
  label = "Ngarko foto",
}: {
  upload: (form: FormData) => Promise<{ error?: string }>;
  /** Extra fields sent with every file (e.g. discipline id). */
  extra?: Record<string, string>;
  maxEdge?: number;
  label?: string;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList) {
    setErrors([]);
    const list = Array.from(files);
    const failed: string[] = [];
    for (const [i, file] of list.entries()) {
      setProgress(`Duke ngarkuar ${i + 1} nga ${list.length}…`);
      const form = new FormData();
      form.set("file", await shrink(file, maxEdge).catch(() => file));
      for (const [k, v] of Object.entries(extra ?? {})) form.set(k, v);
      const result = await upload(form).catch(() => ({ error: "Ngarkimi dështoi." }));
      if (result.error) failed.push(`${file.name}: ${result.error}`);
    }
    setProgress(null);
    setErrors(failed);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <label className="admin-upload-trigger btn btn-primary cursor-pointer !py-2.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-500">
        <Icon name="upload" className="h-5 w-5 shrink-0" />
        <span aria-live="polite">{progress ?? label}</span>
        <input ref={input} aria-label={label} type="file" accept="image/*" multiple className="sr-only" disabled={!!progress} onChange={(e) => e.target.files && onFiles(e.target.files)} />
      </label>
      {errors.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-red-700">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
