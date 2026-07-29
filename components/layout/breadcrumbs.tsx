"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { SEGMENT_LABEL_KEYS } from "./nav";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const tMain = useTranslations("nav.main");
  const tSegments = useTranslations("nav.segments");
  const tSidebar = useTranslations("sidebar");

  return (
    <nav aria-label={tSidebar("breadcrumbs")} className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link
        href="/"
        className={
          segments.length === 0
            ? "font-medium text-zinc-900"
            : "text-zinc-400 transition-colors hover:text-zinc-900"
        }
      >
        {tMain("dashboard")}
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const last = index === segments.length - 1;
        const segmentKey = SEGMENT_LABEL_KEYS[segment];
        const label = segmentKey
          ? tSegments(segmentKey)
          : segment.charAt(0).toUpperCase() + segment.slice(1);
        return (
          <Fragment key={href}>
            <ChevronRight size={13} strokeWidth={1.5} className="shrink-0 text-zinc-300" />
            {last ? (
              <span className="truncate font-medium text-zinc-900">{label}</span>
            ) : (
              <Link href={href} className="text-zinc-400 transition-colors hover:text-zinc-900">
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
