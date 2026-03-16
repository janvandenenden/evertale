"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";

interface FooterLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

const PRIMARY_LINKS: FooterLink[] = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create" },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
];

const SECONDARY_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#first-story", label: "Momotaro" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function SiteFooter() {
  const { isSignedIn } = useAuth();

  const primaryLinks = PRIMARY_LINKS.filter(
    (link) => !link.requiresAuth || isSignedIn,
  );

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="divide-y divide-border/60">
          <div className="flex flex-col items-center justify-between gap-4 py-5 text-center sm:flex-row sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <Link
                href="/"
                className="inline-flex items-center gap-3 font-display text-lg font-semibold tracking-tight text-foreground"
              >
                <span className="size-2 rounded-full bg-primary" />
                Evertale
              </Link>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your child, the hero of every story.
              </p>
            </div>

            <nav
              aria-label="Footer primary navigation"
              className="w-full sm:w-auto"
            >
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium sm:justify-end">
                {primaryLinks.map((link) => (
                  <li key={link.href}>
                    {!isSignedIn && link.href === "/create" ? (
                      <SignInButton mode="modal" forceRedirectUrl="/create">
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </button>
                      </SignInButton>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex flex-col-reverse items-center justify-between gap-3 py-4 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-muted-foreground">
              Copyright &copy; {new Date().getFullYear()} Evertale. All rights
              reserved.
            </p>

            <nav aria-label="Footer secondary navigation">
              <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:justify-end">
                {SECONDARY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
