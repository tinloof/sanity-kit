import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MAX_FILENAME_LENGTH, PREVIEW_SUFFIX } from "./constants";

export interface StorageCredentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region?: string;
  publicUrl?: string;
  forcePathStyle?: boolean;
}

export interface StorageUploadResult {
  key: string;
  publicUrl: string;
  filename: string;
  contentType: string;
  size: number;
}

export function createS3Client(credentials: StorageCredentials): S3Client {
  return new S3Client({
    region: credentials.region || "auto",
    endpoint: credentials.endpoint,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    forcePathStyle: credentials.forcePathStyle ?? false,
  });
}

export async function getPresignedUploadUrl(
  s3Client: S3Client,
  bucketName: string,
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export function getPublicUrl(
  credentials: StorageCredentials,
  key: string
): string {
  if (credentials.publicUrl) {
    return `${credentials.publicUrl.replace(/\/$/, "")}/${key}`;
  }

  const endpoint = credentials.endpoint.replace(/\/$/, "");
  const bucketName = credentials.bucketName;

  if (credentials.forcePathStyle) {
    return `${endpoint}/${bucketName}/${key}`;
  }

  try {
    const url = new URL(endpoint);
    return `${url.protocol}//${bucketName}.${url.host}/${key}`;
  } catch {
    return `${endpoint}/${bucketName}/${key}`;
  }
}

export function generateKey(filename: string, prefix = "uploads"): string {
  const timestamp = Date.now();
  const randomId = crypto.randomUUID();
  const sanitizedFilename = filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .slice(0, MAX_FILENAME_LENGTH);
  return `${prefix}/${timestamp}-${randomId}-${sanitizedFilename}`;
}

function uploadWithPresignedUrl(
  presignedUrl: string,
  file: File,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed due to network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}

export async function uploadFile(
  credentials: StorageCredentials,
  file: File,
  onProgress?: (progress: number) => void
): Promise<StorageUploadResult> {
  const s3Client = createS3Client(credentials);
  const key = generateKey(file.name);
  const presignedUrl = await getPresignedUploadUrl(
    s3Client,
    credentials.bucketName,
    key,
    file.type
  );

  await uploadWithPresignedUrl(presignedUrl, file, file.type, onProgress);

  return {
    key,
    publicUrl: getPublicUrl(credentials, key),
    filename: file.name,
    contentType: file.type,
    size: file.size,
  };
}

export async function validateCredentials(
  credentials: StorageCredentials
): Promise<boolean> {
  try {
    const s3Client = createS3Client(credentials);
    await getPresignedUploadUrl(
      s3Client,
      credentials.bucketName,
      "_test_validation_",
      "text/plain",
      60
    );
    return true;
  } catch {
    return false;
  }
}

export async function deleteFile(
  credentials: StorageCredentials,
  key: string
): Promise<void> {
  const s3Client = createS3Client(credentials);
  const command = new DeleteObjectCommand({
    Bucket: credentials.bucketName,
    Key: key,
  });
  await s3Client.send(command);
}

/**
 * Derive preview key from original key - just append suffix
 */
export function getPreviewKey(originalKey: string): string {
  return `${originalKey}${PREVIEW_SUFFIX}`;
}

/**
 * Upload a Blob (not File) to storage
 */
export async function uploadBlob(
  credentials: StorageCredentials,
  blob: Blob,
  key: string,
  contentType: string
): Promise<{ publicUrl: string }> {
  const s3Client = createS3Client(credentials);
  const presignedUrl = await getPresignedUploadUrl(
    s3Client,
    credentials.bucketName,
    key,
    contentType
  );

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  return { publicUrl: getPublicUrl(credentials, key) };
}

export const StorageEndpoints = {
  awsS3: (region: string) => `https://s3.${region}.amazonaws.com`,
  cloudflareR2: (accountId: string) =>
    `https://${accountId}.r2.cloudflarestorage.com`,
} as const;
