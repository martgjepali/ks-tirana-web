import { Icon, type IconName } from "./Icons";

/** Friendly placeholder for sections the club has not filled in yet. */
export function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-line bg-surface px-6 py-16 text-center">
      <Icon name={icon} className="h-8 w-8 text-blue-500/60" />
      <p className="mt-4 max-w-sm text-ink/60">{text}</p>
    </div>
  );
}
