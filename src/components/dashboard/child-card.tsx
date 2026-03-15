"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageIcon, Trash2, Eye } from "lucide-react";
import { deleteChild } from "@/app/(main)/dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CharacterStatus } from "@/lib/types";

interface CharacterInfo {
  id: string;
  status: CharacterStatus;
  preview_image_url: string | null;
}

interface ChildCardProps {
  child: {
    id: string;
    name: string;
    birth_year: number;
  };
  latestCharacter: CharacterInfo | null;
}

const STATUS_LABELS: Record<CharacterStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  generating_character: { label: "Generating", variant: "secondary" },
  generating_preview: { label: "Almost done", variant: "secondary" },
  completed: { label: "Ready", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
};

export function ChildCard({ child, latestCharacter }: ChildCardProps) {
  const router = useRouter();

  async function handleDelete() {
    const result = await deleteChild(child.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`${child.name} has been removed.`);
    router.refresh();
  }

  const statusInfo = latestCharacter
    ? STATUS_LABELS[latestCharacter.status]
    : null;

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="font-display text-lg">{child.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Born {child.birth_year}
          </p>
        </div>
        {statusInfo && (
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {latestCharacter?.preview_image_url ? (
          <div className="mb-4 overflow-hidden rounded-lg border border-border/60">
            <img
              src={latestCharacter.preview_image_url}
              alt={`${child.name}'s character`}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-border bg-warm/30">
            <ImageIcon className="size-8 text-muted-foreground/40" />
          </div>
        )}

        <div className="flex gap-2">
          {latestCharacter?.status === "completed" && (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/characters/${latestCharacter.id}`}>
                <Eye className="mr-1.5 size-3.5" />
                View
              </Link>
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {child.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {child.name}&apos;s profile, photos,
                  and all generated characters. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
