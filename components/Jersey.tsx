/**
 * Small kit icon for match cards: KS Tirana's white-and-blue stripes, or a
 * plain neutral shirt for the opponent (their colours are not stored).
 */
export function Jersey({ club, className = "h-11 w-11" }: { club: boolean; className?: string }) {
  const id = club ? "ks-stripes" : undefined;
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className}`} aria-hidden>
      {club && (
        <defs>
          <pattern id={id} width="8" height="48" patternUnits="userSpaceOnUse">
            <rect width="8" height="48" fill="#ffffff" />
            <rect x="4" width="4" height="48" fill="#0057d8" />
          </pattern>
        </defs>
      )}
      <path
        d="M17 5 7 10l-4 11 7 3 2-5v24h24V19l2 5 7-3-4-11-10-5c-1 3.5-3.6 5.5-7 5.5S18 8.5 17 5z"
        fill={club ? `url(#${id})` : "#c7cfdd"}
        stroke={club ? "#0a3a73" : "#8a96ab"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
