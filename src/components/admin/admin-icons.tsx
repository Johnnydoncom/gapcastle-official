import type { SVGProps } from "react";

/* Line icons for the admin interface — 24px grid, 1.8 stroke. */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
} as const;

const icon = (paths: React.ReactNode) =>
  function Icon(p: IconProps) {
    return (
      <svg {...base} {...p}>
        {paths}
      </svg>
    );
  };

export const IconOverview = icon(
  <>
    <rect x="3.5" y="3.5" width="7" height="8" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
    <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
    <rect x="3.5" y="14.5" width="7" height="6" rx="1.5" />
  </>,
);
export const IconApplications = icon(
  <>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10Z" />
    <path d="M14 3.5v5h5M9 13h6M9 16.5h4" />
  </>,
);
export const IconInbox = icon(
  <>
    <path d="M3.5 13.5 6 5.5a2 2 0 0 1 1.9-1.5h8.2A2 2 0 0 1 18 5.5l2.5 8" />
    <path d="M3.5 13.5v5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5h-5l-1.5 2.5h-4L8.5 13.5Z" />
  </>,
);
export const IconPeople = icon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14a6.5 6.5 0 0 1 3 6" />
  </>,
);
export const IconGift = icon(
  <>
    <rect x="3.5" y="8" width="17" height="4" rx="1" />
    <path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12M12 8v12.5M12 8S10.8 3.5 8 3.5a2.2 2.2 0 0 0 0 4.5M12 8s1.2-4.5 4-4.5a2.2 2.2 0 0 1 0 4.5" />
  </>,
);
export const IconAt = icon(
  <>
    <circle cx="12" cy="12" r="3.8" />
    <path d="M15.8 12v1.3a2.7 2.7 0 0 0 5.4 0V12a9.2 9.2 0 1 0-3.6 7.3" />
  </>,
);
export const IconPen = icon(
  <>
    <path d="M4 20h4.5L19.3 9.2a2.1 2.1 0 0 0 0-3L17.8 4.7a2.1 2.1 0 0 0-3 0L4 15.5Z" />
    <path d="m13.5 6 4.5 4.5" />
  </>,
);
export const IconTag = icon(
  <>
    <path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-7.8 7.8a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z" />
    <circle cx="8" cy="8" r="1.4" />
  </>,
);
export const IconImage = icon(
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="9.5" r="1.8" />
    <path d="m20.5 15.5-4.8-4.8a1 1 0 0 0-1.4 0L5.5 19.5" />
  </>,
);
export const IconUsers = icon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </>,
);
export const IconSettings = icon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </>,
);
export const IconSend = icon(<path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5Z" />);
export const IconAccount = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.2 18.7a6.5 6.5 0 0 1 11.6 0" />
  </>,
);
export const IconExternal = icon(<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />);
export const IconSignOut = icon(<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />);
export const IconMenu = icon(<path d="M4 7h16M4 12h16M4 17h10" />);
export const IconClose = icon(<path d="m6 6 12 12M18 6 6 18" />);
export const IconPlus = icon(<path d="M12 5v14M5 12h14" />);
export const IconSearch = icon(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </>,
);
export const IconUpload = icon(<path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />);
export const IconTrash = icon(<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.8 12.1a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10 11v6M14 11v6" />);
