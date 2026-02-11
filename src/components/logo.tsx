import type { SVGProps } from "react";

/**
 * CatchUp AI open-book logo.
 * Uses currentColor so it inherits text-ember, text-white, etc.
 * Matches the icons8-study-comic PNG but as a clean vector.
 */
export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Left page */}
      <path d="M2 6s1.5-2 5-2 5.5 2 5.5 2v13s-1.5-1.5-5.5-1.5S2 19 2 19V6Z" />
      {/* Right page */}
      <path d="M12.5 6s1.5-2 5-2 4.5 2 4.5 2v13s-1-1.5-4.5-1.5-5 1.5-5 1.5V6Z" />
      {/* Text lines - left page */}
      <path d="M5 9.5h4" strokeWidth={1.25} />
      <path d="M5 12h4" strokeWidth={1.25} />
      <path d="M5 14.5h3" strokeWidth={1.25} />
      {/* Text lines - right page */}
      <path d="M15 9.5h4" strokeWidth={1.25} />
      <path d="M15 12h4" strokeWidth={1.25} />
      <path d="M15 14.5h3" strokeWidth={1.25} />
    </svg>
  );
}
