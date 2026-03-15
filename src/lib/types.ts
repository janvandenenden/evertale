export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CharacterStatus =
  | "pending"
  | "generating_character"
  | "generating_preview"
  | "completed"
  | "failed";

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export type ProductType = "personalized_book" | "founding_family_edition";

export type StoryStatus = "active" | "coming_soon" | "archived";

export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  birth_year: number;
  created_at: string;
  updated_at: string;
}

export interface ChildPhoto {
  id: string;
  child_id: string;
  image_url: string;
  storage_key: string;
  created_at: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  status: StoryStatus;
  created_at: string;
}

export interface CharacterVersion {
  id: string;
  child_id: string;
  story_id: string;
  source_photo_id: string;
  status: CharacterStatus;
  generation_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterSheet {
  id: string;
  character_version_id: string;
  story_id: string;
  phase: string;
  image_url: string;
  created_at: string;
}

export interface CharacterVersionScene {
  id: string;
  character_version_id: string;
  scene_id: string;
  image_url: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  child_id: string;
  character_version_id: string;
  story_id: string;
  stripe_session_id: string;
  product_type: ProductType;
  price_cents: number;
  currency: string;
  status: OrderStatus;
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  created_at: string;
  updated_at: string;
}
