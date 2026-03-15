import { getReplicateClient } from "./client";

const MODEL = "google/nano-banana-2" as const;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 120;

interface PredictionResult {
  id: string;
  status: string;
  output: unknown;
  error: string | null;
}

export async function generateSceneImage(
  prompt: string,
  characterSheetUrl: string,
  sceneTemplateUrl: string
): Promise<string> {
  const replicate = getReplicateClient();

  const prediction = await replicate.predictions.create({
    model: MODEL,
    input: {
      prompt,
      image_input: [characterSheetUrl, sceneTemplateUrl],
      resolution: "1K",
      aspect_ratio: "5:4",
    },
  });

  const result = await pollPrediction(prediction.id);

  if (result.status === "failed") {
    throw new Error(result.error ?? "Scene generation failed");
  }

  const output = result.output;
  if (!output) {
    throw new Error("No output from scene generation");
  }

  if (Array.isArray(output)) {
    return output[0] as string;
  }

  return output as string;
}

async function pollPrediction(
  predictionId: string
): Promise<PredictionResult> {
  const replicate = getReplicateClient();

  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "succeeded" || prediction.status === "failed") {
      return prediction as unknown as PredictionResult;
    }

    if (prediction.status === "canceled") {
      throw new Error("Generation was canceled");
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Generation timed out");
}
