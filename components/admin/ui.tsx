import Link from "next/link";
import type { Key, ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icons";

/* Building blocks shared by every admin page (server-safe, no client state). */

export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6 sm:items-end">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-1 inline-flex min-h-11 items-center gap-2 rounded-sm pr-2 text-sm font-semibold text-blue-500 hover:underline active:bg-surface-2 lg:mb-2 lg:min-h-0">
            <Icon name="arrowLeft" className="h-5 w-5 shrink-0 lg:h-4 lg:w-4" />
            {back.label}
          </Link>
        )}
        <h1 className="text-2xl leading-tight font-extrabold text-strong [overflow-wrap:anywhere] sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/65 [overflow-wrap:anywhere]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

/** Success / error message from ?ok= / ?gabim= after a save. */
export function Notice({ ok, error }: { ok?: string | string[]; error?: string | string[] }) {
  const o = Array.isArray(ok) ? ok[0] : ok;
  const e = Array.isArray(error) ? error[0] : error;
  if (!o && !e) return null;
  return (
    <p
      role={e ? "alert" : "status"}
      className={`mb-5 border-l-4 px-4 py-3 text-sm font-semibold ${
        e ? "border-red-600 bg-red-50 text-red-800" : "border-emerald-600 bg-emerald-50 text-emerald-800"
      }`}
    >
      {e ?? o}
    </p>
  );
}

export function Card({ title, children, className = "", aside }: { title?: string; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <section className={`min-w-0 rounded-xl border border-line bg-white p-3.5 sm:p-6 lg:rounded-none ${className}`}>
      {(title || aside) && (
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          {title && <h2 className="text-lg font-extrabold text-strong">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, wide, className = "" }: { label: string; hint?: ReactNode; children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <label className={`block min-w-0 ${wide ? "sm:col-span-2" : ""} ${className}`}>
      <span className="text-sm font-bold text-strong">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-ink/55">{hint}</span>}
    </label>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`field ${props.className ?? ""}`} />;
}

export function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string | number; label: string }[] }) {
  return (
    <select {...props} className={`field ${props.className ?? ""}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 py-1 lg:min-h-0">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 accent-[#0057d8]" />
      <span>
        <span className="text-sm font-bold text-strong">{label}</span>
        {hint && <span className="block text-xs text-ink/55">{hint}</span>}
      </span>
    </label>
  );
}

/** Albanian / English pair for a translatable field. */
export function Bilingual({
  label,
  name,
  values,
  textarea,
  rows,
  required,
}: {
  label: string;
  name: string;
  values: { sq?: string | null; en?: string | null };
  textarea?: boolean;
  rows?: number;
  required?: boolean;
}) {
  const Comp = textarea ? Textarea : Input;
  return (
    <>
      <Field label={`${label} (shqip)${required ? " *" : ""}`}>
        <Comp name={`${name}_sq`} defaultValue={values.sq ?? ""} required={required} rows={rows} />
      </Field>
      <Field label={`${label} (anglisht)`} hint="Bosh = shfaqet teksti shqip.">
        <Comp name={`${name}_en`} defaultValue={values.en ?? ""} rows={rows} />
      </Field>
    </>
  );
}

export function LinkButton({ href, children, variant = "primary", icon, compact }: { href: string; children: ReactNode; variant?: "primary" | "ghost"; icon?: IconName; compact?: boolean }) {
  return (
    <Link href={href} className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} !py-2.5 ${compact ? "min-h-11 min-w-11 !px-0 sm:!px-3" : ""}`}>
      {icon && <Icon name={icon} className="h-5 w-5 shrink-0" />}
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{children}</span>
    </Link>
  );
}

type TableRow = { id: Key; href: string; title: ReactNode; details: ReactNode[] };
type MobileColumn = IconName | "value";

export function Table({ head, rows, compact, mobileColumns }: { head: string[]; rows: TableRow[]; compact?: boolean; mobileColumns?: (MobileColumn | undefined)[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white md:overflow-x-auto lg:rounded-none">
      <table role="table" className={`admin-table w-full text-left text-sm ${compact ? "" : "md:min-w-[40rem]"}`}>
        <thead role="rowgroup" className="sr-only bg-surface text-xs font-bold uppercase tracking-wide text-ink/70 md:not-sr-only">
          <tr role="row">
            {head.map((h) => (
              <th key={h} role="columnheader" scope="col" className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="divide-y divide-line">
          {rows.map((row) => (
            <tr role="row" key={row.id} className="active:bg-surface-2 md:hover:bg-surface">
              <th role="rowheader" scope="row" className="min-w-0 px-4 py-3">
                <Link href={row.href} className="admin-row-link flex items-center justify-between gap-3 font-bold text-strong md:inline md:text-blue-500 md:hover:underline">
                  <span className="min-w-0">{row.title}</span>
                  <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-blue-500 md:hidden" />
                </Link>
              </th>
              {row.details.map((value, i) => {
                const mobile = mobileColumns?.[i];
                return (
                  <td role="cell" key={head[i + 1]} className="min-w-0 px-4 py-3">
                    {mobile && mobile !== "value" ? (
                      <div className="flex items-start gap-1.5 md:block">
                        <Icon name={mobile} className="mt-px h-4 w-4 shrink-0 text-ink/70 md:hidden" />
                        <span className="min-w-0">{value}</span>
                      </div>
                    ) : (
                      <>
                        {!mobile && <span aria-hidden="true" className="mb-0.5 block text-[0.6875rem] leading-tight font-semibold text-ink/70 md:hidden">{head[i + 1]}</span>}
                        {value}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="px-4 py-7 text-center text-ink/65">Asgjë për të shfaqur.</p>}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "gray" | "blue" | "amber" | "red"; children: ReactNode }) {
  const tones = {
    green: "bg-emerald-100 text-emerald-800",
    gray: "bg-surface-2 text-ink/70",
    blue: "bg-blue-500/10 text-blue-600",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
  };
  return <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function FilterButton() {
  return (
    <button className="btn btn-ghost min-h-11 min-w-11 !px-0 !py-2.5 sm:!px-3" type="submit">
      <Icon name="filter" className="h-5 w-5 shrink-0" />
      <span className="sr-only sm:not-sr-only">Filtro</span>
    </button>
  );
}

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
