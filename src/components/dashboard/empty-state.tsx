import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-warm shadow-sm ring-1 ring-border/60">
        <BookOpen className="size-7 text-warm-accent" />
      </div>
      <div>
        <h2 className="font-display text-xl font-medium">No characters yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Create your first storybook character by uploading a photo of your
          child.
        </p>
      </div>
      <Button asChild>
        <Link href="/create">
          Create Your First Character
          <ArrowRight className="ml-2 size-4" data-icon="inline-end" />
        </Link>
      </Button>
    </div>
  );
}
