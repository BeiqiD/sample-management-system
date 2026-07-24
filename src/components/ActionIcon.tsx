export type ActionIconName = "export" | "moon" | "note" | "sun";

const iconPaths: Record<ActionIconName, React.ReactNode> = {
  export: <path d="M12 3.5v11M8 10.5l4 4 4-4M5 17v3h14v-3" />,
  moon: <path d="M19.5 15.2A8.4 8.4 0 0 1 8.8 4.5 8.5 8.5 0 1 0 19.5 15.2Z" />,
  note: <>
    <path d="M6 3.5h8l4 4v13H6z" />
    <path d="M14 3.5v4h4M9 14h6M12 11v6" />
  </>,
  sun: <>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </>,
};

export function ActionIcon({ name }: { name: ActionIconName }) {
  return <svg
    className="action-icon"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {iconPaths[name]}
  </svg>;
}
