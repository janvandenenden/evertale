import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (client) return client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 environment variables");
  }

  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}

export function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("Missing R2_BUCKET_NAME");
  return bucket;
}

export function getPublicUrl(): string {
  const url = process.env.R2_PUBLIC_URL;
  if (!url) throw new Error("Missing R2_PUBLIC_URL");
  return url;
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const r2 = getR2Client();
  await r2.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${getPublicUrl()}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const r2 = getR2Client();
  await r2.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    })
  );
}

export async function getFromR2(key: string): Promise<Uint8Array> {
  const r2 = getR2Client();
  const response = await r2.send(
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    })
  );
  if (!response.Body) throw new Error("Empty response from R2");
  return response.Body.transformToByteArray();
}

export function buildStorageKey(
  prefix: "uploads" | "assets",
  userId: string,
  fileName: string,
  options?: { stable?: boolean }
): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (options?.stable) {
    return `${prefix}/${userId}/${sanitized}`;
  }
  const timestamp = Date.now();
  return `${prefix}/${userId}/${timestamp}-${sanitized}`;
}

export function buildStoryStorageKey(
  storySlug: string,
  type: "characters" | "previews" | "assets",
  userId: string,
  fileName: string,
  options?: { stable?: boolean }
): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (options?.stable) {
    return `${storySlug}/${type}/${userId}/${sanitized}`;
  }
  const timestamp = Date.now();
  return `${storySlug}/${type}/${userId}/${timestamp}-${sanitized}`;
}
