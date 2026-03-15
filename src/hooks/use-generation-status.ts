"use client";

import { useEffect, useRef, useState } from "react";
import type { CharacterStatus } from "@/lib/types";

interface GenerationStatus {
  id: string;
  status: CharacterStatus;
  character_sheets: { phase: string; image_url: string }[];
  scenes: { scene_id: string; image_url: string }[];
  last_error: string | null;
}

const POLL_INTERVAL_MS = 3000;

export function useGenerationStatus(characterVersionId: string | null) {
  const [data, setData] = useState<GenerationStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPolling =
    !!characterVersionId &&
    (!data ||
      (data.status !== "completed" && data.status !== "failed"));

  useEffect(() => {
    if (!characterVersionId) {
      queueMicrotask(() => setData(null));
      return;
    }

    async function poll() {
      try {
        const response = await fetch(
          `/api/generation-status/${characterVersionId}`
        );
        if (!response.ok) return;

        const result = await response.json();
        if (!result.success) return;

        setData(result.data);

        if (
          result.data.status === "completed" ||
          result.data.status === "failed"
        ) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch {
        // Silently retry on network errors
      }
    }

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [characterVersionId]);

  return { data, isPolling };
}
