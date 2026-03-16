"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

interface NavLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

const LANDING_NAV: NavLink[] = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Momotaro", href: "#first-story" },
  { label: "Pricing", href: "#pricing" },
];

const APP_NAV: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", requiresAuth: true },
  { label: "Create", href: "/create" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  const isLanding = pathname === "/";
  const navLinks = (isLanding ? LANDING_NAV : APP_NAV).filter(
    (link) => !link.requiresAuth || isSignedIn,
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg font-display">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Evertale
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : !isSignedIn && link.href === "/create" ? (
              <SignInButton
                key={link.href}
                mode="modal"
                forceRedirectUrl="/create"
              >
                <button
                  type="button"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </button>
              </SignInButton>
            ) : (
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
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button variant="ghost" size="lg">
                Sign In
              </Button>
            </SignInButton>
          )}
          {isLanding &&
            (isSignedIn ? (
              <Button asChild size="lg">
                <Link href="/create">Create Your Character</Link>
              </Button>
            ) : (
              <SignInButton mode="modal" forceRedirectUrl="/create">
                <Button size="lg">Create Your Character</Button>
              </SignInButton>
            ))}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="top"
            className="h-dvh flex flex-col w-full max-w-none border-l border-border/60 bg-background/95 p-0 backdrop-blur-xl"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation menu</SheetTitle>
              <SheetDescription>
                Main site navigation and account actions.
              </SheetDescription>
            </SheetHeader>

            <div className="flex h-full flex-col overflow-y-auto px-6 pb-6 pt-16">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : !isSignedIn && link.href === "/create" ? (
                    <SignInButton
                      key={link.href}
                      mode="modal"
                      forceRedirectUrl="/create"
                    >
                      <button
                        type="button"
                        className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </button>
                    </SignInButton>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm transition-colors hover:text-foreground ${
                        pathname === link.href
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>

              <SheetFooter className="pt-8">
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="outline" size="lg" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
                {isLanding &&
                  (isSignedIn ? (
                    <Button asChild size="lg" className="w-full">
                      <Link href="/create">Create Your Character</Link>
                    </Button>
                  ) : (
                    <SignInButton mode="modal" forceRedirectUrl="/create">
                      <Button size="lg" className="w-full">
                        Create Your Character
                      </Button>
                    </SignInButton>
                  ))}
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
