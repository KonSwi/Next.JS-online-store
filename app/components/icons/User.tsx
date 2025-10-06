import * as React from "react";

export default function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="7" r="3.5" fill="currentColor" />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
