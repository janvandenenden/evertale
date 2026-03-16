import { getReplicateClient } from "./client";

const MODEL = "google/nano-banana-2" as const;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 120;
const COVER_IMAGE_URL =
  "https://pub-ff52a9b8fb2f4031be59d54e6d7b632f.r2.dev/cover-example.jpeg";

interface PredictionResult {
  id: string;
  status: string;
  output: unknown;
  error: string | null;
}

async function pollPrediction(predictionId: string): Promise<PredictionResult> {
  const replicate = getReplicateClient();

  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "succeeded" || prediction.status === "failed") {
      return prediction as unknown as PredictionResult;
    }

    if (prediction.status === "canceled") {
      throw new Error("Preview generation was canceled");
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Preview generation timed out");
}

export async function generatePreviewImage(
  prompt: string,
  characterSheetUrl: string
): Promise<string> {
  const replicate = getReplicateClient();

  const prediction = await replicate.predictions.create({
    model: MODEL,
    input: {
      prompt,
      image_input: [characterSheetUrl, COVER_IMAGE_URL],
      resolution: "1K",
      // The uploaded cover image is close to 5:4, so this matches better than 4:3.
      aspect_ratio: "5:4",
    },
  });

  const result = await pollPrediction(prediction.id);

  if (result.status === "failed") {
    throw new Error(result.error ?? "Preview generation failed");
  }

  const output = result.output;
  if (!output) {
    throw new Error("No output from preview generation");
  }

  if (Array.isArray(output)) {
    return output[0] as string;
  }

  return output as string;
}
