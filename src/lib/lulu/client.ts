const LULU_API_BASE = process.env.LULU_API_BASE || "https://api.sandbox.lulu.com";
const LULU_AUTH_URL = `${LULU_API_BASE}/auth/realms/glasstree/protocol/openid-connect/token`;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientKey = process.env.LULU_CLIENT_KEY;
  const clientSecret = process.env.LULU_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    throw new Error("Missing LULU_CLIENT_KEY or LULU_CLIENT_SECRET env vars");
  }

  const credentials = Buffer.from(`${clientKey}:${clientSecret}`).toString("base64");

  const response = await fetch(LULU_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Lulu auth failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export interface ValidateInteriorResult {
  id: number;
  source_url: string;
  page_count: string | null;
  errors: string[];
  status: "VALIDATING" | "VALIDATED" | "ERROR";
  valid_pod_package_ids: string[];
}

export async function validateInterior(
  sourceUrl: string,
  podPackageId?: string
): Promise<ValidateInteriorResult> {
  const token = await getAccessToken();

  const body: Record<string, string> = { source_url: sourceUrl };
  if (podPackageId) {
    body.pod_package_id = podPackageId;
  }

  const response = await fetch(`${LULU_API_BASE}/validate-interior/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Lulu validate-interior failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function getValidationStatus(
  validationId: number
): Promise<ValidateInteriorResult> {
  const token = await getAccessToken();

  const response = await fetch(`${LULU_API_BASE}/validate-interior/${validationId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Lulu get validation failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export interface CoverDimensions {
  width: number;
  height: number;
  unit: string;
}

/**
 * Get the exact cover PDF dimensions from Lulu for a given book configuration.
 * Returns width and height in the requested unit (defaults to points).
 */
export async function getCoverDimensions(
  podPackageId: string,
  interiorPageCount: number,
  unit: "pt" | "mm" | "inch" = "pt"
): Promise<CoverDimensions> {
  const token = await getAccessToken();

  const response = await fetch(`${LULU_API_BASE}/cover-dimensions/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      pod_package_id: podPackageId,
      interior_page_count: interiorPageCount,
      unit,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lulu cover-dimensions failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return {
    width: parseFloat(data.width),
    height: parseFloat(data.height),
    unit: data.unit,
  };
}
