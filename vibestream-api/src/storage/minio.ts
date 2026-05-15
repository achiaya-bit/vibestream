import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";
import { config } from "../config.js";

let client: S3Client | undefined;

export function getMinioClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "us-east-1",
      endpoint: config.minio.url,
      credentials: {
        accessKeyId: config.minio.accessKey,
        secretAccessKey: config.minio.secretKey,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

function isBucketMissing(err: unknown): boolean {
  const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
  const code = err && typeof err === "object" && "Code" in err ? String((err as { Code: string }).Code) : "";
  return name === "NotFound" || code === "NotFound" || code === "NoSuchBucket";
}

export async function ensureMinioBuckets(): Promise<void> {
  const s3 = getMinioClient();
  for (const Bucket of [config.minio.bucketSongs, config.minio.bucketCovers]) {
    try {
      await s3.send(new HeadBucketCommand({ Bucket }));
    } catch (err) {
      if (!isBucketMissing(err)) throw err;
      await s3.send(new CreateBucketCommand({ Bucket }));
      console.log(`MinIO bucket created: ${Bucket}`);
    }
  }
}

export async function ensureMinioBucketsWithRetry(
  retries = 15,
  delayMs = 2000,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await ensureMinioBuckets();
      return;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

export async function putObject(
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await getMinioClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  await getMinioClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function getObjectStream(
  bucket: string,
  key: string,
  range?: string,
): Promise<{
  body: Readable;
  contentType?: string;
  contentLength?: number;
  contentRange?: string;
  statusCode: number;
}> {
  const response = await getMinioClient().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: range,
    }),
  );

  if (!response.Body) {
    throw new Error(`Empty object body for ${bucket}/${key}`);
  }

  return {
    body: response.Body as Readable,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    contentRange: response.ContentRange,
    statusCode: range && response.ContentRange ? 206 : 200,
  };
}

export async function objectExists(bucket: string, key: string): Promise<boolean> {
  try {
    await getMinioClient().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function bucketSizeBytes(bucket: string): Promise<number> {
  const s3 = getMinioClient();
  let total = 0;
  let continuationToken: string | undefined;

  do {
    const page = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken }),
    );
    for (const item of page.Contents ?? []) {
      total += item.Size ?? 0;
    }
    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  return total;
}

export async function minioStorageBytes(): Promise<number> {
  const [songs, covers] = await Promise.all([
    bucketSizeBytes(config.minio.bucketSongs),
    bucketSizeBytes(config.minio.bucketCovers),
  ]);
  return songs + covers;
}
