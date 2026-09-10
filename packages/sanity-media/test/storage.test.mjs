import assert from "node:assert/strict";
import test from "node:test";
import {
	createS3Client,
	getPresignedUploadUrl,
	getPublicUrl,
	uploadFilePresigned,
} from "../dist/index.js";

const credentials = {
	endpoint: "https://storage.example.test",
	accessKeyId: "fixture-access",
	secretAccessKey: "fixture-secret",
	bucketName: "media",
	region: "auto",
};

for (const forcePathStyle of [false, true]) {
	test(`presigning preserves endpoint, key, expiry and addressing (path style: ${forcePathStyle})`, async () => {
		const client = createS3Client({...credentials, forcePathStyle});
		try {
			const url = new URL(
				await getPresignedUploadUrl(
					client,
					"media",
					"uploads/a file.jpg",
					"image/jpeg",
					300,
				),
			);
			assert.equal(
				url.hostname,
				forcePathStyle ? "storage.example.test" : "media.storage.example.test",
			);
			assert.equal(
				url.pathname,
				`${forcePathStyle ? "/media" : ""}/uploads/a%20file.jpg`,
			);
			assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
			assert.equal(url.searchParams.get("X-Amz-Algorithm"), "AWS4-HMAC-SHA256");
			assert.match(
				url.searchParams.get("X-Amz-Credential"),
				/fixture-access\/\d{8}\/auto\/s3\/aws4_request/,
			);
			assert.match(url.searchParams.get("X-Amz-Signature"), /^[a-f0-9]{64}$/);
		} finally {
			client.destroy();
		}
	});
}

test("public URLs preserve custom CDN and path-style storage paths", () => {
	assert.equal(
		getPublicUrl(
			{...credentials, publicUrl: "https://cdn.example.test/"},
			"uploads/file.jpg",
		),
		"https://cdn.example.test/uploads/file.jpg",
	);
	assert.equal(
		getPublicUrl({...credentials, forcePathStyle: true}, "uploads/file.jpg"),
		"https://storage.example.test/media/uploads/file.jpg",
	);
});

test("an adapter authorization failure prevents upload and surfaces its reason", async () => {
	const file = new File(["example"], "example.txt", {type: "text/plain"});
	await assert.rejects(
		uploadFilePresigned(
			{
				presign: async () => {
					throw new Error("Forbidden");
				},
			},
			file,
		),
		/Failed to get upload URL: Forbidden/,
	);
});
