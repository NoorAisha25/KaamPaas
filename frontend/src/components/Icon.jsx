// Centralized icon set - clean stroke-based SVG icons (no emoji anywhere).
// Usage: <Icon name="mic" size={20} />
const PATHS = {
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  shield: "M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3z",
  briefcase: "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1 M3 12h18",
  hardhat: "M4 18v-1a8 8 0 0 1 16 0v1 M2 18h20 M12 4v5",
  check: "M20 6 9 17l-5-5",
  checkCircle: "M22 11.1V12a10 10 0 1 1-5.9-9.1 M22 4 12 14.1l-3-3",
  star: "M12 2.5l3 6.3 6.8.9-5 4.9 1.2 6.9-6-3.3-6 3.3 1.2-6.9-5-4.9 6.8-.9z",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.4 2.1L8 10.1a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.5c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2.1z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
  plus: "M12 5v14 M5 12h14",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  arrowRight: "M5 12h14 M13 6l6 6-6 6",
  wrench: "M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-3.1 3.1-2-2z",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8z",
  brush: "M9 15c-3 0-4 2-4 4a3 3 0 0 0 5 2 M18 3 9 12l3 3 9-9a2 2 0 0 0-3-3z",
  brick: "M3 6h8v5H3z M13 6h8v5h-8z M7 11v5H3v-5 M17 11v5h4v-5 M7 16h10v5H7z",
  saw: "M2 17l6-6 3 3-6 6-3-3z M11 8l3-3 8 8-3 3-8-8z M14 5l3-3 M19 10l3-3",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  trash: "M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  scissors: "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M20 4 8.1 15.9 M20 20 8.1 8.1",
  leaf: "M11 20A7 7 0 0 1 4 13c0-8 7-11 15-11 0 8-3 15-11 15-1.5 0-2.5-.3-3.5-1z M4 20l7-7",
  utensils: "M6 2v20 M3 2v6a3 3 0 0 0 6 0V2 M18 2c-2 2-3 4-3 8s1 5 3 5v7",
  car: "M5 17h14 M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M3 17V11l2-5h10l3 5h1a2 2 0 0 1 2 2v4h-2 M5 11h13",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  mapPinSmall: "M12 21s-6-5.3-6-9.5a6 6 0 0 1 12 0c0 4.2-6 9.5-6 9.5z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
};

export default function Icon({ name, size = 20, className = "", style = {} }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      <path d={d} />
    </svg>
  );
}
