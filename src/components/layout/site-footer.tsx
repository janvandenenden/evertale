import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-warm/50">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <Link
              href="/"
              className="font-display text-lg font-semibold tracking-tight text-foreground"
            >
              Evertale
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              Your child, the hero of every story.
            </p>
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/create" className="transition-colors hover:text-foreground">
              Create
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="mt-4 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          {new Date().getFullYear()} Evertale. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
