"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { label: "Story Scenes", href: "/admin/story-scenes" },
  { label: "Text Pages", href: "/admin/text-pages" },
  { label: "Book Preview", href: "/admin/book-preview" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </span>
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors hover:text-foreground ${
              pathname === link.href
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
