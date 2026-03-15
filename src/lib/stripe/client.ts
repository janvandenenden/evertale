import Stripe from "stripe";

let instance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (instance) return instance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  instance = new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  });

  return instance;
}
