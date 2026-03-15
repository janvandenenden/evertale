"use client";

import { useGenerationStatus } from "@/hooks/use-generation-status";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface GenerationScreenProps {
  characterVersionId: string;
  childName: string;
  onRetry: () => void;
}

const STATUS_MESSAGES: Record<string, { label: string; progress: number }> = {
  pending: { label: "Preparing your character...", progress: 10 },
  generating_character: {
    label: "Creating your child's storybook character...",
    progress: 40,
  },
  generating_preview: {
    label: "Placing your child into the story world...",
    progress: 75,
  },
  completed: { label: "Your character is ready!", progress: 100 },
  failed: { label: "Something went wrong.", progress: 0 },
};

export function GenerationScreen({
  characterVersionId,
  childName,
  onRetry,
}: GenerationScreenProps) {
  const { data } = useGenerationStatus(characterVersionId);
  const router = useRouter();

  const status = data?.status ?? "pending";
  const info = STATUS_MESSAGES[status] ?? STATUS_MESSAGES.pending;

  useEffect(() => {
    if (status === "completed") {
      const timer = setTimeout(() => {
        router.push(`/characters/${characterVersionId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, characterVersionId, router]);

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <div>
          <h3 className="font-display text-xl font-medium">
            Something went wrong creating the character.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {data?.last_error ?? "Please try again."}
          </p>
        </div>
        <Button onClick={onRetry} className="h-12">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center">
      <div className="relative flex size-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-warm-accent/20" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-warm shadow-sm ring-1 ring-border/60">
          <Sparkles className="size-7 text-warm-accent" />
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-medium">
          {info.label}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We are creating {childName}&apos;s story character. This usually takes
          about 20 seconds.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <Progress value={info.progress} className="h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{info.progress}%</p>
      </div>
    </div>
  );
}
