import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
} as const;

export const ArrowRight = (p: IconProps) => (
  <svg {...stroke} strokeWidth={2.4} aria-hidden {...p}>
    <path d="M4 12h15m0 0-6-6m6 6-6 6" />
  </svg>
);

export const ArrowDown = (p: IconProps) => (
  <svg {...stroke} strokeWidth={2.4} aria-hidden {...p}>
    <path d="M12 4v15m0 0 6-6m-6 6-6-6" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...stroke} strokeWidth={3} aria-hidden {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const Phone = (p: IconProps) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M2.5 6.2c0 7.9 6.4 14.3 14.3 14.3h2.1a2.1 2.1 0 0 0 2.1-2.1v-1.3c0-.5-.3-.9-.8-1l-4.2-1.1c-.4-.1-.9.1-1.1.4l-.9 1.2c-.3.4-.7.5-1.2.4a11.5 11.5 0 0 1-6.8-6.8c-.2-.4 0-.9.4-1.2l1.2-.9c.3-.3.5-.7.4-1.1L6.9 2.8a1.1 1.1 0 0 0-1-.8H4.6a2.1 2.1 0 0 0-2.1 2.1v2.1Z" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M2.5 7.5v9a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-15a2 2 0 0 0-2 2Z" />
    <path d="m3 8 8.4 5.2a1.2 1.2 0 0 0 1.2 0L21 8" />
  </svg>
);

export const Pin = (p: IconProps) => (
  <svg {...stroke} aria-hidden {...p}>
    <circle cx="12" cy="10" r="3" />
    <path d="M19.5 10c0 6.6-7.5 11-7.5 11S4.5 16.6 4.5 10a7.5 7.5 0 0 1 15 0Z" />
  </svg>
);

export const Clock = (p: IconProps) => (
  <svg {...stroke} aria-hidden {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.3 2" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="M4 7h16M4 12h16M4 17h11" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...stroke} aria-hidden {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const Quote = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M9.6 5C6 7 4 9.8 4 13.4 4 16.4 5.9 19 8.8 19c2.3 0 4-1.7 4-4s-1.6-3.9-3.8-3.9c-.4 0-.8.1-1 .1.4-1.8 1.8-3.5 3.6-4.6L9.6 5Zm10 0c-3.6 2-5.6 4.8-5.6 8.4 0 3 1.9 5.6 4.8 5.6 2.3 0 4-1.7 4-4s-1.6-3.9-3.8-3.9c-.4 0-.8.1-1 .1.4-1.8 1.8-3.5 3.6-4.6L19.6 5Z" />
  </svg>
);

export const Facebook = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3Z" />
  </svg>
);

export const WhatsApp = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.2.6.4 0 .1 0 .7-.4 1.5Z" />
  </svg>
);

export const Apple = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M17.5 12.6c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.9-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.7-3.9ZM15.1 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.8-1.4Z" />
  </svg>
);

export const PlayStore = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.7 2.2l-.1.1Zm12.4 9.3-2.7-2.7 3-3 3.6 2c1 .6 1 1.5 0 2.1l-3.9 1.6Zm-.6.6-2.8 2.8 3 3 3.6-2.1c1-.6 1-1.5 0-2.1l-3.8-1.6ZM4.9 2.9l8.4 8.4 2.8-2.8L8.5 1.6c-.4-.2-.8-.3-1.2-.2-.8.2-1.7.7-2.4 1.5Zm0 18.2 7.6-7.6-2.8-2.8-8.2 8.2c.7.7 1.6 1.2 2.4 1.4.4.1.8 0 1-.2Z" />
  </svg>
);

export const Spinner = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
