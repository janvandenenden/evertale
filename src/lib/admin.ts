export function getAdminClerkUserIds(): string[] {
  const raw = process.env.ADMIN_CLERK_USER_IDS;
  if (!raw || typeof raw !== "string") return [];
  return raw.split(",").map((id) => id.trim()).filter(Boolean);
}

export function isAdminClerkUserId(clerkUserId: string): boolean {
  const ids = getAdminClerkUserIds();
  if (ids.length === 0) return false;
  return ids.includes(clerkUserId);
}
