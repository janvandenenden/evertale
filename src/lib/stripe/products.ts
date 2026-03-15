export const PRODUCTS = {
  personalized_book: {
    name: "Personalized Storybook",
    description: "A personalized hardcover Momotaro storybook featuring your child",
    price_cents: 3900,
    currency: "usd",
    cta_label: "Reserve Book",
    badge_label: undefined,
    features: [
      "Personalized character",
      "Hardcover book",
      "Momotaro story",
    ],
  },
  founding_family_edition: {
    name: "Founding Family Edition",
    description:
      "Everything in Personalized Storybook, plus printable poster, character sheet, coloring pages, and Founding Family badge",
    price_cents: 4900,
    currency: "usd",
    cta_label: "Reserve Founding Edition",
    badge_label: "Limited",
    features: [
      "Everything in Personalized Storybook",
      "Printable poster",
      "Character sheet",
      "Coloring pages",
      "Founding Family badge",
    ],
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

const PRICE_ID_ENV_KEYS: Record<ProductKey, string> = {
  personalized_book: "STRIPE_PRICE_ID_PERSONALIZED_BOOK",
  founding_family_edition: "STRIPE_PRICE_ID_FOUNDING_FAMILY_EDITION",
};

export function getStripePriceId(productKey: ProductKey): string {
  const key = PRICE_ID_ENV_KEYS[productKey];
  const priceId = process.env[key];
  if (!priceId) {
    throw new Error(`Missing ${key} environment variable`);
  }
  return priceId;
}
