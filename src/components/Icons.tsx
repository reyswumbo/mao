import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>, size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    ...props,
  };
}

type P = SVGProps<SVGSVGElement>;

export const HomeIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const GridIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const BookIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
    <path d="M4 19a2 2 0 0 1 2-2h13" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

export const ChevronLeftIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRightIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronUpIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export const XIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const SettingsIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .33 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.33 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-1-1.47 1.6 1.6 0 0 0-1.77.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .33-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.09a1.6 1.6 0 0 0 1.47-1 1.6 1.6 0 0 0-.33-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.33h.09a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.09a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.33 1.77v.09a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1.47 1Z" />
  </svg>
);

export const ExpandIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export const CompressIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M8 3v5H3M21 3l-7 7M3 21l7-7M16 21v-5h5" />
  </svg>
);

export const ArrowLeftIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </svg>
);

export const PlayIcon = (p: P) => (
  <svg {...base(p, 20)} fill="currentColor">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const FlameIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M12 22c4.4 0 7-2.8 7-6.5 0-3-1.8-5.6-3.8-7.4l-1-4.1-1.8 3.1a7 7 0 0 0-2.2-.9L8.6 4l.3 4.1C6.2 9.9 5 12.4 5 15.5 5 19.2 7.6 22 12 22Z" />
    <path d="M12 12.5c2 1.6 2 3 0 4.6-2-1.6-2-3 0-4.6Z" />
  </svg>
);

export const SparkIcon = (p: P) => (
  <svg {...base(p, 20)}>
    <path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2 2.8-2.8" />
  </svg>
);