import assert from "node:assert/strict";
import test from "node:test";
import {deleteAssets} from "../src/delete-assets.ts";

const image = {_id: "image", path: "image.png", mediaType: "image"};
const thumbnail = {_id: "thumbnail", path: "thumbnail.jpg", mediaType: "image"};
const video = {_id: "video", path: "video.mp4", mediaType: "video", thumbnail};

function setup(reject = false) {
	const events = [];
	const transaction = {
		delete(id) { events.push(`document:${id}`); return this; },
		async commit() {
			events.push("commit");
			if (reject) throw new Error("Document is referenced or deletion is forbidden");
		},
	};
	return {events, client: {transaction: () => transaction}};
}

for (const [name, assets] of [["single image", [image]], ["video and thumbnail", [video]], ["bulk", [image, video]]]) {
	test(`rejected ${name} transaction leaves all storage untouched`, async () => {
		const {client} = setup(true);
		let storageCalls = 0;
		await assert.rejects(deleteAssets(client, assets, async () => { storageCalls++; return true; }), /referenced/);
		assert.equal(storageCalls, 0);
	});
}

test("commits all document deletions before touching storage, including thumbnails", async () => {
	const {client, events} = setup();
	const failed = await deleteAssets(client, [image, video], async (asset) => {
		events.push(`storage:${asset.path}`);
		return true;
	});
	assert.deepEqual(failed, []);
	assert.deepEqual(events, ["document:image", "document:thumbnail", "document:video", "commit", "storage:image.png", "storage:thumbnail.jpg", "storage:video.mp4"]);
});

test("selecting a video and its thumbnail deletes each document and file once", async () => {
	const {client, events} = setup();
	await deleteAssets(client, [thumbnail, {...video, thumbnail: {_id: "thumbnail"}}], async (asset) => {
		events.push(`storage:${asset.path}`);
		return true;
	});
	assert.deepEqual(events, ["document:thumbnail", "document:video", "commit", "storage:thumbnail.jpg", "storage:video.mp4"]);
});

test("reports rejected and unsupported cleanup while still attempting every file", async () => {
	const {client} = setup();
	const attempted = [];
	const failed = await deleteAssets(client, [image, video], async (asset) => {
		attempted.push(asset._id);
		if (asset._id === "image") throw new Error("Delete failed with status 403");
		return asset._id !== "thumbnail";
	});
	assert.deepEqual(attempted, ["image", "thumbnail", "video"]);
	assert.deepEqual(failed.map((asset) => asset._id), ["image", "thumbnail"]);
});

test("reports deleted thumbnail with missing storage path", async () => {
	const {client} = setup();
	const failed = await deleteAssets(client, [{...video, thumbnail: {_id: "thumbnail"}}], async (asset) => Boolean(asset.path));
	assert.deepEqual(failed.map((asset) => asset._id), ["thumbnail"]);
});
