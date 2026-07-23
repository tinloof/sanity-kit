import type {StorageCredentials} from "./storage-client";

/**
 * Response from a presign function, containing the URL to upload to
 * and the public URL the file will be accessible at after upload.
 */
export interface PresignedUrlResponse {
	/** The presigned URL to PUT the file to */
	uploadUrl: string;
	/** The public URL the file will be accessible at after upload */
	publicUrl: string;
	/**
	 * Storage key for the uploaded file, used for deletion.
	 * Falls back to publicUrl if omitted.
	 *
	 * Important: if omitted, publicUrl must be a stable identifier that
	 * presignDelete can use to locate the object. Avoid URLs with query params,
	 * CDN transformations, or signed tokens. If the public URL differs from
	 * the storage key (e.g. CloudFront domain vs S3 key), always return key explicitly.
	 */
	key?: string;
}

/**
 * Base adapter interface that defines credential schema
 */
export interface StorageAdapter {
	/** Unique identifier for this adapter */
	id: string;
	/** Display name for the adapter */
	name: string;
	/** Description of the storage provider */
	description?: string;
	/** Type prefix for generated schema types (e.g., "r2" → r2.imageAsset) */
	typePrefix: string;

	// Credential-based mode (existing, now optional)
	/** Credential field definitions */
	fields?: AdapterField[];
	/** Convert user input to StorageCredentials */
	toCredentials?: (values: Record<string, string>) => StorageCredentials;

	// Presigned URL mode (new)
	/** Get a presigned URL for uploading a file. Called just-in-time before each upload. */
	presign?: (file: {
		filename: string;
		contentType: string;
		contentLength: number;
	}) => Promise<PresignedUrlResponse>;
	/** Get a presigned URL for deleting a file from storage */
	presignDelete?: (key: string) => Promise<{deleteUrl: string}>;
}

/**
 * Field definition for adapter configuration
 */
export interface AdapterField {
	/** Field key */
	key: string;
	/** Display label */
	label: string;
	/** Field description/help text */
	description?: string;
	/** Field type */
	type: "text" | "password" | "url";
	/** Whether this field is required */
	required: boolean;
	/** Placeholder text */
	placeholder?: string;
	/** Default value */
	defaultValue?: string;
}

/**
 * Cloudflare R2 adapter factory
 */
export function R2Adapter(): StorageAdapter {
	return {
		id: "cloudflare-r2",
		name: "Cloudflare R2",
		description: "Store media files in Cloudflare R2 object storage",
		typePrefix: "r2",
		fields: [
			{
				key: "accountId",
				label: "Account ID",
				description: "Your Cloudflare account ID",
				type: "text",
				required: true,
				placeholder: "abc123def456",
			},
			{
				key: "accessKeyId",
				label: "Access Key ID",
				description: "R2 API token access key ID",
				type: "text",
				required: true,
				placeholder: "R2_ACCESS_KEY_ID",
			},
			{
				key: "secretAccessKey",
				label: "Secret Access Key",
				description: "R2 API token secret access key",
				type: "password",
				required: true,
			},
			{
				key: "bucketName",
				label: "Bucket Name",
				description: "Name of your R2 bucket",
				type: "text",
				required: true,
				placeholder: "my-media-bucket",
			},
			{
				key: "publicUrl",
				label: "Public URL (Optional)",
				description: "Custom domain or R2.dev URL for public access",
				type: "url",
				required: false,
				placeholder: "https://media.example.com",
			},
		],
		toCredentials: (values) => ({
			endpoint: `https://${values.accountId}.r2.cloudflarestorage.com`,
			accessKeyId: values.accessKeyId,
			secretAccessKey: values.secretAccessKey,
			bucketName: values.bucketName,
			region: "auto",
			publicUrl: values.publicUrl || undefined,
			forcePathStyle: false,
		}),
	};
}
