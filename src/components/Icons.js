// A small set of inline SVG icons. They are decorative (aria-hidden): every icon sits next to
// text or inside a button that has its own accessible name.
const base = {
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: "false",
};
const make = (paths) => function Icon({ className = "", ...rest }) {
  return <svg {...base} className={className} {...rest}>{paths}</svg>;
};

export const IconCart = make(<><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" /></>);
export const IconUser = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const IconMenu = make(<path d="M4 6h16M4 12h16M4 18h16" />);
export const IconClose = make(<path d="M6 6l12 12M18 6 6 18" />);
export const IconChevronDown = make(<path d="m6 9 6 6 6-6" />);
export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const IconCheck = make(<path d="m5 12 5 5 9-10" />);
export const IconAlert = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></>);
export const IconInbox = make(<><path d="M3 13l3-8h12l3 8" /><path d="M3 13v6h18v-6h-5l-1.5 2h-5L8 13H3z" /></>);
export const IconChart = make(<><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-5M12 16V8M16 16v-3" /></>);
export const IconKitchen = make(<><path d="M6 3v7a3 3 0 0 0 3 3v8" /><path d="M9 3v7" /><path d="M18 3c-2 1.5-3 4-3 7h3v11" /></>);
export const IconPlus = make(<path d="M12 5v14M5 12h14" />);
export const IconMinus = make(<path d="M5 12h14" />);
export const IconTrash = make(<><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>);
export const IconArrowUp = make(<path d="M12 19V5M6 11l6-6 6 6" />);
export const IconArrowDown = make(<path d="M12 5v14M6 13l6 6 6-6" />);
export const IconChevronLeft = make(<path d="m15 6-6 6 6 6" />);
export const IconChevronRight = make(<path d="m9 6 6 6-6 6" />);
export const IconSort = make(<path d="M8 9l4-4 4 4M8 15l4 4 4-4" />);
export const IconPlate = make(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /></>);
