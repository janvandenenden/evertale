import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getR2Client, getBucketName, getPublicUrl } from "./r2";

export interface R2Object {
  readonly key: string;
  readonly url: string;
}

export async function listR2Objects(prefix: string): Promise<R2Object[]> {
  const r2 = getR2Client();
  const bucket = getBucketName();
  const publicUrl = getPublicUrl();

  const response = await r2.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    })
  );

  if (!response.Contents) return [];

  return response.Contents.filter((obj) => obj.Key).map((obj) => ({
    key: obj.Key!,
    url: `${publicUrl}/${obj.Key}`,
  }));
}
