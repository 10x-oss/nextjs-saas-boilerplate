import { S3Client } from "@aws-sdk/client-s3";

type StorageClient = {
  client: S3Client;
  bucket: string;
};

let cached: StorageClient | null = null;

function resolveStorageConfig() {
  const bucket = process.env.R2_BUCKET ?? process.env.SPACES_BUCKET;
  const endpoint =
    process.env.R2_ENDPOINT ??
    process.env.R2_PUBLIC_ENDPOINT ??
    process.env.SPACES_ENDPOINT;
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID ?? process.env.SPACES_KEY;
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY ?? process.env.SPACES_SECRET;
  const region =
    process.env.R2_REGION ?? process.env.SPACES_REGION ?? "auto";

  if (!bucket) {
    throw new Error("Missing storage bucket configuration (R2_BUCKET / SPACES_BUCKET)");
  }
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing storage access key configuration (R2_ACCESS_KEY_ID / SPACES_KEY)");
  }

  return {
    bucket,
    endpoint,
    accessKeyId,
    secretAccessKey,
    region,
  };
}

export function getStorageClient(): StorageClient {
  if (cached) return cached;

  const { bucket, endpoint, accessKeyId, secretAccessKey, region } =
    resolveStorageConfig();

  const client = new S3Client({
    region,
    ...(endpoint ? { endpoint } : {}),
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  cached = { client, bucket };
  return cached;
}
