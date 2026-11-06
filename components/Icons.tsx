type IconProps = {
  name: IconName;
  className?: string;
};

export type IconName =
  | "ball"
  | "hoop"
  | "volley"
  | "track"
  | "swim"
  | "bike"
  | "menu"
  | "close"
  | "chevronRight"
  | "arrowRight"
  | "calendar"
  | "mail"
  | "phone"
  | "pin"
  | "clock"
  | "instagram"
  | "facebook"
  | "youtube"
  | "shirt"
  | "users"
  | "trophy"
  | "shield"
  | "handshake";

const paths: Record<IconName, React.ReactNode> = {
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v3.2M12 17.8V21M4.5 7.5l2.8 1.6M16.7 14.9l2.8 1.6M4.5 16.5l2.8-1.6M16.7 9.1l2.8-1.6M12 6.2l-3.8 2.8 1.5 4.5h4.6l1.5-4.5z" />
    </>
  ),
  hoop: (
    <>
      <rect x="4" y="4" width="16" height="12" rx="1" />
      <circle cx="12" cy="10" r="4.2" />
      <path d="M4 20h16" />
    </>
  ),
  volley: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c3 2.6 3 15.4 0 18M5.3 7c3.4 1.6 10 1.6 13.4 0M5.3 17c3.4-1.6 10-1.6 13.4 0" />
    </>
  ),
  track: (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <ellipse cx="12" cy="12" rx="5" ry="3.2" />
    </>
  ),
  swim: (
    <>
      <path d="M3 17c1.6 1.2 3.2 1.2 4.8 0 1.6-1.2 3.2-1.2 4.8 0 1.6 1.2 3.2 1.2 4.8 0 1.6-1.2 3.2-1.2 4.6 0" />
      <path d="M7 13 15.5 6l3 3-9 7" />
      <circle cx="16.5" cy="5.2" r="1.3" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="17" r="3.2" />
      <circle cx="18" cy="17" r="3.2" />
      <path d="M6 17 10 9h5l3 8M10 9 8.5 6h-2M10 9l3.5 5h4.5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  chevronRight: <path d="M9 6l6 6-6 6" />,
  arrowRight: <path d="M4 12h16M14 6l6 6-6 6" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 6.5l8 6.5 8-6.5" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5c1.3 0 2.4.9 2.9 2.2l.6 1.6c.3.8.1 1.7-.5 2.3l-1 1c.9 2 2.5 3.6 4.5 4.5l1-1c.6-.6 1.5-.8 2.3-.5l1.6.6c1.3.5 2.2 1.6 2.2 2.9v1.4c0 1.4-1.3 2.4-2.6 2-6.6-1.9-11.7-7-13.6-13.6-.4-1.3.6-2.6 2-2.6z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14.5 9.2H17V6.4h-2.5c-2.2 0-3.5 1.4-3.5 3.6v1.6H9v2.8h2v7.1h3v-7.1h2.3l.4-2.8h-2.7v-1.3c0-.7.3-1.1 1.5-1.1z" />
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  shirt: (
    <path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3-2 1.6c-.6.5-1.4.5-2 0L8 4z" />
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M15 20c.4-2.4 1.8-4 4-4.4" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 7 9M17 5h2.5A2.5 2.5 0 0 1 17 9" />
      <path d="M12 13v3M9 20h6M10 16.5h4l.5 3.5h-5z" />
    </>
  ),
  shield: (
    <path d="M12 3.5 19 6v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
  ),
  handshake: (
    <path d="M3 12l4-4 3 2 3-2.3L17 10l4-3M7 10l3.3 3.3a1.7 1.7 0 0 0 2.4 0l.1-.1M14 10.5l2.3 2.3a1.6 1.6 0 0 0 2.3 0M9 14l-2.5 2.5a1.6 1.6 0 0 0 0 2.3 1.6 1.6 0 0 0 2.3 0" />
  ),
};

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
