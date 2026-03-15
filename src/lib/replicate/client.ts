import Replicate from "replicate";

let instance: Replicate | null = null;

export function getReplicateClient(): Replicate {
  if (instance) return instance;

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("Missing REPLICATE_API_TOKEN");
  }

  instance = new Replicate({ auth: token });
  return instance;
}
