// @vitest-environment jsdom
import {createClient} from "@sanity/client";
import {act, type ReactNode} from "react";
import {createRoot, type Root} from "react-dom/client";
import {of, Subject} from "rxjs";
import {createSchema, type DocumentActionComponent} from "sanity";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const host = vi.hoisted(() => ({
	client: null as any,
	config: {} as any,
	toast: {push: vi.fn()},
	open: vi.fn(),
	navigateIntent: vi.fn(),
	metadata: [] as any[],
	references: [] as any[],
	store: null as any,
	editState: {} as any,
	onChange: vi.fn(),
	permissions: {granted: true},
	loading: false,
	referenceLoading: false,
	referenceError: null as Error | null,
}));
vi.mock("sanity", async (importOriginal) => ({
	...(await importOriginal<typeof import("sanity")>()),
	useClient: () => host.client,
	useDocumentStore: () => host.store,
	useDocumentOperation: () => ({duplicate: {disabled: false}}),
	useDocumentPairPermissions: () => [host.permissions, false],
	useCurrentUser: () => ({id: "editor"}),
	useTranslation: () => ({t: (key: string) => key}),
	useEditState: () => host.editState,
}));
vi.mock("sanity/router", () => ({
	useRouter: () => ({navigateIntent: host.navigateIntent}),
}));
vi.mock("sanity/structure", () => ({
	structureLocaleNamespace: "structure",
	useDocumentPane: () => ({onChange: host.onChange}),
}));
vi.mock("@sanity/ui/toast", () => ({useToast: () => host.toast}));
vi.mock("@sanity/ui/tooltip", () => ({Tooltip: ({children}: any) => children}));
vi.mock("@sanity/ui", () => {
	const Container = ({children}: any) => <div>{children}</div>;
	return {
		Badge: Container,
		Box: Container,
		Card: Container,
		Flex: Container,
		Grid: Container,
		Stack: Container,
		Text: Container,
		Spinner: () => null,
		Button: ({children, text, onClick, disabled}: any) => (
			<button type="button" onClick={onClick} disabled={disabled}>
				{children ?? text}
			</button>
		),
	};
});
vi.mock("../src/components/document-i18n-context", () => ({
	useDocumentI18nContext: () => host.config,
}));
vi.mock("../src/hooks/use-open-in-new-pane", () => ({
	useOpenInNewPane: (id: string, type: string) => () => host.open(id, type),
}));
vi.mock("../src/hooks/use-locale-metadata", () => ({
	useTranslationMetadata: () => ({data: host.metadata, loading: host.loading}),
}));
vi.mock("sanity-plugin-utils", () => ({
	useListeningQuery: () => ({
		data: host.references,
		loading: host.referenceLoading,
		error: host.referenceError,
	}),
}));
vi.mock("../src/components/delete-translation-dialog/document-preview", () => ({
	default: () => null,
}));

import {DeleteMetadataAction} from "../src/actions/delete-metadata-action";
import {DeleteTranslationAction} from "../src/actions/delete-translation-action";
import {DuplicateWithTranslationsAction} from "../src/actions/duplicate-with-transaltion-action";
import LocaleOption from "../src/components/locale-option";
import LocalePatch from "../src/components/locale-patch";
import ReferencePatcher from "../src/components/optimistically-strengthen/reference-patcher";
import {DEFAULT_CONFIG} from "../src/constants";
import {useStrengthenTranslation} from "../src/hooks/use-strengthen-translation";
import {documentI18n} from "../src/plugin";
import {createReference} from "../src/utils/create-reference";
import {metadata, pageSchema, source} from "./fixtures";

let root: Root;
let container: HTMLDivElement;
let mutate: ReturnType<typeof vi.fn>;
let action: any;
const onComplete = vi.fn();
const actionProps = {
	id: source._id,
	type: "page",
	draft: null,
	published: source,
	onComplete,
} as any;
function ActionHarness({component: Component, props = actionProps}: any) {
	action = Component(props);
	return action?.dialog?.type === "dialog" ? (
		<>
			{action.dialog.content}
			{action.dialog.footer}
		</>
	) : null;
}
const optionProps = {
	locale: {id: "fr", title: "French"},
	schemaType: pageSchema,
	documentId: source._id,
	disabled: false,
	current: false,
	source,
	metadataId: metadata._id,
	sourceLocaleId: "en",
};
async function render(node: ReactNode) {
	await act(async () => root.render(node));
}
async function click(text?: string) {
	const button = [...container.querySelectorAll("button")].find(
		(b) => !text || b.textContent?.includes(text),
	);
	expect(button).toBeDefined();
	await act(async () => button!.click());
}
function transactions() {
	return mutate.mock.calls.map(([mutations]) => mutations);
}

beforeEach(() => {
	(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
	host.client = createClient({
		projectId: "test1234",
		dataset: "test",
		apiVersion: "2025-02-19",
		useCdn: false,
	});
	mutate = vi
		.spyOn(host.client, "mutate")
		.mockResolvedValue({transactionId: "local-fixture"});
	host.config = {...DEFAULT_CONFIG};
	host.metadata = [metadata];
	host.references = [metadata];
	host.permissions = {granted: true};
	host.loading = false;
	host.referenceLoading = false;
	host.referenceError = null;
	host.editState = {ready: true, draft: null, published: source};
	container = document.createElement("div");
	document.body.append(container);
	root = createRoot(container);
});
afterEach(async () => {
	await act(async () => root.unmount());
	container.remove();
	vi.restoreAllMocks();
});

describe("registered group duplication restrictions", () => {
	function registeredAction(original: DocumentActionComponent) {
		host.store = {pair: {}};
		original.action = "duplicate";
		const actions = documentI18n({locales: [{id: "en", title: "English"}]})
			.document!.actions as any;
		return actions([original], {
			schema: createSchema({
				name: "restricted-actions",
				types: [
					{
						name: "page",
						type: "document",
						fields: [{name: "locale", type: "string"}],
					},
				],
			}),
			schemaType: "page",
			versionType: "published",
		})[1];
	}
	it("hides group duplication when the original action returns null", async () => {
		const component = registeredAction(() => null);
		await render(<ActionHarness component={component} />);
		expect(action).toBeNull();
		expect(mutate).not.toHaveBeenCalled();
	});
	it("preserves document-specific disabled state and responds when it changes", async () => {
		const component = registeredAction(({published}) => ({
			label: "Duplicate",
			disabled: Boolean(published?.locked),
		}));
		await render(
			<ActionHarness
				component={component}
				props={{...actionProps, published: {...source, locked: true}}}
			/>,
		);
		expect(action.disabled).toBe(true);
		await render(<ActionHarness component={component} />);
		expect(action.disabled).toBe(false);
		expect(action.label).toBe("action.duplicate.label");
		expect(mutate).not.toHaveBeenCalled();
	});
	it("retains translation permission restrictions when the original action is enabled", async () => {
		host.permissions = {granted: false};
		const component = registeredAction(() => ({
			label: "Duplicate",
			disabled: false,
		}));
		await render(<ActionHarness component={component} />);
		expect(action.disabled).toBe(true);
		expect(mutate).not.toHaveBeenCalled();
	});
});

describe("translation creation", () => {
	it.each([null, metadata])(
		"creates a draft atomically with locale-keyed metadata (existing: %j)",
		async (existing) => {
			const callback = vi.fn().mockResolvedValue(undefined);
			host.config.callback = callback;
			await render(<LocaleOption {...optionProps} metadata={existing} />);
			await click();
			expect(mutate).toHaveBeenCalledTimes(1);
			const [create, ensure, patch] = transactions()[0];
			expect(create.create).toMatchObject({
				_type: "page",
				locale: "fr",
				title: source.title,
				settings: {visible: "keep"},
			});
			expect(create.create).not.toHaveProperty("secret");
			expect(create.create).not.toHaveProperty("enabled");
			expect(create.create).not.toHaveProperty("count");
			const id = create.create._id.replace(/^drafts\./, "");
			expect(create.create._id).toBe(`drafts.${id}`);
			expect(ensure).toEqual({
				createIfNotExists: {
					_id: metadata._id,
					_type: "translation.metadata",
					schemaTypes: ["page"],
					translations: [createReference("en", "page-en", "page")],
				},
			});
			expect(patch).toEqual({
				patch: {
					id: metadata._id,
					setIfMissing: {
						translations: [createReference("en", "page-en", "page")],
					},
					insert: {
						after: "translations[-1]",
						items: [createReference("fr", id, "page")],
					},
				},
			});
			expect(callback).toHaveBeenCalledWith(
				expect.objectContaining({
					sourceDocument: source,
					newDocument: create.create,
					destinationLocaleId: "fr",
					sourceLocaleId: "en",
					metaDocumentId: metadata._id,
				}),
			);
			await click();
			expect(mutate).toHaveBeenCalledTimes(1);
		},
	);
	it("opens an existing locale without writing or migrating metadata", async () => {
		await render(
			<LocaleOption
				{...optionProps}
				locale={{id: "de", title: "German"}}
				metadata={metadata}
			/>,
		);
		await click();
		expect(host.open).toHaveBeenCalledWith("page-de", "page");
		expect(mutate).not.toHaveBeenCalled();
	});
	it.each([
		{current: true},
		{disabled: true},
		{source: null},
		{metadataId: null},
		{sourceLocaleId: undefined},
	])(
		"prevents creation when required state is unavailable: %j",
		async (props) => {
			await render(<LocaleOption {...optionProps} {...props} />);
			await click();
			expect(mutate).not.toHaveBeenCalled();
		},
	);
	it("supports the configured locale field and intentionally weak references", async () => {
		host.config = {
			...host.config,
			localeField: "customLocale",
			weakReferences: true,
		};
		await render(<LocaleOption {...optionProps} />);
		await click();
		expect(transactions()[0][0].create.customLocale).toBe("fr");
		expect(transactions()[0][2].patch.insert.items[0].value).not.toHaveProperty(
			"_strengthenOnPublish",
		);
	});
	it("reports a failed commit, skips the callback and allows retry", async () => {
		mutate.mockRejectedValueOnce(new Error("Write rejected"));
		host.config.callback = vi.fn();
		await render(<LocaleOption {...optionProps} />);
		await click();
		expect(host.config.callback).not.toHaveBeenCalled();
		expect(host.toast.push).toHaveBeenCalledWith(
			expect.objectContaining({
				status: "error",
				title: "Error creating translation",
			}),
		);
		expect(container.querySelector("button")?.disabled).toBe(false);
		await click();
		expect(mutate).toHaveBeenCalledTimes(2);
	});
	it("reports callback failure without retrying an already committed translation", async () => {
		host.config.callback = vi
			.fn()
			.mockRejectedValue(new Error("Callback failed"));
		await render(<LocaleOption {...optionProps} />);
		await click();
		expect(host.toast.push).toHaveBeenCalledWith(
			expect.objectContaining({status: "error", title: "Callback"}),
		);
		expect(host.toast.push).toHaveBeenCalledWith(
			expect.objectContaining({status: "success"}),
		);
		await click();
		expect(mutate).toHaveBeenCalledTimes(1);
	});
	it("patches a locale on the supplied draft with the configured field", async () => {
		host.config.localeField = "customLocale";
		await render(
			<LocalePatch
				locale={{id: "fr", title: "French"}}
				source={{...source, _id: "drafts.page-en"}}
				disabled={false}
			/>,
		);
		await click();
		expect(transactions()[0]).toEqual({
			patch: {id: "drafts.page-en", set: {customLocale: "fr"}},
		});
	});
});

describe("translation deletion", () => {
	it("unlinks only the selected locale before a separate confirmed deletion", async () => {
		await render(<ActionHarness component={DeleteTranslationAction} />);
		expect(mutate).not.toHaveBeenCalled();
		await act(async () => action.onHandle());
		expect(mutate).not.toHaveBeenCalled();
		await click("Unset translation reference");
		expect(transactions()[0]).toEqual([
			{
				patch: {
					id: metadata._id,
					ifRevisionID: metadata._rev,
					unset: ['translations[_key == "en"]'],
				},
			},
		]);
		expect(action.dialog).toBeTruthy();
		host.references = [];
		await render(<ActionHarness component={DeleteTranslationAction} />);
		await click("Delete document");
		expect(transactions()[1]).toEqual([
			{delete: {id: "page-en"}},
			{delete: {id: "drafts.page-en"}},
		]);
		expect(action.dialog).toBe(false);
	});
	it("unlinks the actual document even when its locale field is stale", async () => {
		await render(
			<ActionHarness
				component={DeleteTranslationAction}
				props={{...actionProps, published: {...source, locale: "de"}}}
			/>,
		);
		await act(async () => action.onHandle());
		await click("Unset translation reference");
		expect(transactions()[0]).toEqual([
			{
				patch: {
					id: metadata._id,
					ifRevisionID: metadata._rev,
					unset: ['translations[_key == "en"]'],
				},
			},
		]);
	});
	it.each(["loading", "error"])(
		"blocks deletion when the reference check is %s",
		async (state) => {
			host.referenceLoading = state === "loading";
			host.referenceError = state === "error" ? new Error("Unavailable") : null;
			await render(<ActionHarness component={DeleteTranslationAction} />);
			await act(async () => action.onHandle());
			await click("Unset translation reference");
			expect(mutate).not.toHaveBeenCalled();
		},
	);
	it("does not unlink an unverified reference revision", async () => {
		host.references = [{...metadata, _rev: undefined}];
		await render(<ActionHarness component={DeleteTranslationAction} />);
		await act(async () => action.onHandle());
		await click("Unset translation reference");
		expect(mutate).not.toHaveBeenCalled();
		expect(host.toast.push).toHaveBeenCalledWith(
			expect.objectContaining({status: "error"}),
		);
	});
	it("leaves deletion open and reports rejected writes", async () => {
		host.references = [];
		mutate.mockRejectedValue(new Error("Referenced by another document"));
		await render(<ActionHarness component={DeleteTranslationAction} />);
		await act(async () => action.onHandle());
		await click("Delete document");
		expect(action.dialog).toBeTruthy();
		expect(host.toast.push).toHaveBeenCalledWith(
			expect.objectContaining({
				status: "error",
				title: "Failed to delete document",
			}),
		);
	});
	it("cancels without changing any document", async () => {
		await render(<ActionHarness component={DeleteTranslationAction} />);
		await act(async () => action.onHandle());
		await click("Cancel");
		expect(mutate).not.toHaveBeenCalled();
		expect(action.dialog).toBe(false);
	});
	it("deletes all translations and metadata in a single confirmed transaction", async () => {
		await render(
			<ActionHarness
				component={DeleteMetadataAction}
				props={{...actionProps, id: metadata._id, published: metadata}}
			/>,
		);
		await act(async () => action.onHandle());
		expect(mutate).not.toHaveBeenCalled();
		await act(async () => action.dialog.onConfirm());
		expect(transactions()[0]).toEqual([
			{patch: {id: metadata._id, unset: ["translations"]}},
			{delete: {id: "page-en"}},
			{delete: {id: "drafts.page-en"}},
			{delete: {id: "page-de"}},
			{delete: {id: "drafts.page-de"}},
			{delete: {id: metadata._id}},
			{delete: {id: `drafts.${metadata._id}`}},
		]);
	});
});

describe("published references", () => {
	it("strengthens a published translation using its existing locale key", async () => {
		await render(
			<ReferencePatcher
				translation={metadata.translations[0]}
				documentType="page"
				metadataId={metadata._id}
			/>,
		);
		expect(host.onChange).toHaveBeenCalledTimes(1);
		expect(host.onChange.mock.calls[0][0].patches).toMatchObject([
			{type: "unset", path: ["translations", {_key: "en"}, "value", "_weak"]},
			{
				type: "unset",
				path: ["translations", {_key: "en"}, "value", "_strengthenOnPublish"],
			},
		]);
	});
	it.each([{ready: false}, {published: null}, {draft: source}])(
		"does not strengthen before publication is ready: %j",
		async (state) => {
			host.editState = {...host.editState, ...state};
			await render(
				<ReferencePatcher
					translation={metadata.translations[0]}
					documentType="page"
					metadataId={metadata._id}
				/>,
			);
			expect(host.onChange).not.toHaveBeenCalled();
		},
	);
	it("leaves explicitly weak references unchanged after publishing", async () => {
		await render(
			<ReferencePatcher
				translation={createReference("en", "page-en", "page", false)}
				documentType="page"
				metadataId={metadata._id}
			/>,
		);
		expect(host.onChange).not.toHaveBeenCalled();
	});
});

function documentStore(failId?: string) {
	const events = new Map<string, Subject<any>>();
	const copies = new Map<string, string>();
	const stream = (id: string) => {
		if (!events.has(id)) events.set(id, new Subject());
		return events.get(id)!;
	};
	host.store = {
		pair: {
			editOperations: (id: string) =>
				of({
					duplicate: {
						disabled: false,
						execute: (newId: string) => {
							copies.set(id, newId);
							stream(id).next({
								op: "duplicate",
								type: id === failId ? "error" : "success",
								error: new Error("Duplicate rejected"),
							});
						},
					},
				}),
			operationEvents: (id: string) => stream(id),
		},
	};
	return copies;
}
describe("duplication with translations", () => {
	it("duplicates every locale and repoints only the copied metadata", async () => {
		const copies = documentStore();
		await render(<ActionHarness component={DuplicateWithTranslationsAction} />);
		await act(async () => action.onHandle());
		expect([...copies.keys()]).toEqual(["page-en", "page-de"]);
		const created = transactions()[0][0].create;
		expect(created._id).not.toBe(metadata._id);
		expect(created).toMatchObject({
			_type: metadata._type,
			schemaTypes: ["page"],
			translations: [
				createReference("en", copies.get("page-en")!, "page"),
				createReference("de", copies.get("page-de")!, "page"),
			],
		});
		expect(created).not.toHaveProperty("_createdAt");
		expect(created).not.toHaveProperty("_rev");
		expect(host.navigateIntent).toHaveBeenCalledWith("edit", {
			id: copies.get("page-en"),
			type: "page",
		});
		expect(onComplete).toHaveBeenCalledOnce();
	});
	it.each(["page-en", metadata._id])(
		"reports operation errors and unlocks the action when %s fails",
		async (id) => {
			documentStore(id);
			if (id === metadata._id)
				mutate.mockRejectedValueOnce(new Error("Metadata create rejected"));
			await render(
				<ActionHarness component={DuplicateWithTranslationsAction} />,
			);
			await act(async () => {
				await Promise.race([
					action.onHandle(),
					new Promise((_, reject) =>
						setTimeout(
							() =>
								reject(
									new Error("Action remained pending after operation error"),
								),
							200,
						),
					),
				]);
			});
			expect(action.disabled).toBe(false);
			expect(mutate).toHaveBeenCalledTimes(id === metadata._id ? 1 : 0);
			expect(onComplete).not.toHaveBeenCalled();
			expect(host.toast.push).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "error",
					title: "Error duplicating document",
				}),
			);
		},
	);
	it.each([
		{data: []},
		{data: [metadata, {...metadata, _id: "other-metadata"}]},
	])(
		"disables duplication with missing or ambiguous metadata",
		async ({data}) => {
			documentStore();
			host.metadata = data;
			await render(
				<ActionHarness component={DuplicateWithTranslationsAction} />,
			);
			expect(action.disabled).toBe(true);
			expect(action.onHandle).toBeUndefined();
		},
	);
	it("disables duplication without permission", async () => {
		documentStore();
		host.permissions.granted = false;
		await render(<ActionHarness component={DuplicateWithTranslationsAction} />);
		expect(action.disabled).toBe(true);
		expect(action.onHandle).toBeUndefined();
	});
});

function StrengthenHarness({
	data = {...metadata, _rev: "metadata-revision"},
	published = true,
}: any) {
	useStrengthenTranslation(data, "page-en", "en", published);
	return null;
}
describe("strengthening from the content editor", () => {
	it("patches only the current locale and protects against concurrent metadata changes", async () => {
		await render(<StrengthenHarness />);
		expect(transactions()[0]).toEqual({
			patch: {
				id: metadata._id,
				ifRevisionID: "metadata-revision",
				unset: [
					'translations[_key=="en"].value._weak',
					'translations[_key=="en"].value._strengthenOnPublish',
				],
			},
		});
	});
	it("does not write for drafts or explicitly configured weak references", async () => {
		await render(<StrengthenHarness published={false} />);
		expect(mutate).not.toHaveBeenCalled();
		host.config.weakReferences = true;
		await render(<StrengthenHarness />);
		expect(mutate).not.toHaveBeenCalled();
	});
	it("does not strengthen a locale that now refers to another document", async () => {
		await render(
			<StrengthenHarness
				data={{
					...metadata,
					_rev: "changed",
					translations: [createReference("en", "different-page", "page")],
				}}
			/>,
		);
		expect(mutate).not.toHaveBeenCalled();
	});
	it("retries with the updated revision after a concurrent write conflict", async () => {
		mutate.mockRejectedValueOnce(
			Object.assign(new Error("Conflict"), {statusCode: 409}),
		);
		await render(<StrengthenHarness />);
		expect(host.toast.push).not.toHaveBeenCalled();
		await render(
			<StrengthenHarness data={{...metadata, _rev: "new-revision"}} />,
		);
		expect(transactions()[1].patch.ifRevisionID).toBe("new-revision");
	});
	it("reports denied reference writes", async () => {
		mutate.mockRejectedValueOnce(
			Object.assign(new Error("Forbidden"), {statusCode: 403}),
		);
		await render(<StrengthenHarness />);
		expect(host.toast.push).toHaveBeenCalledWith(
			expect.objectContaining({
				status: "error",
				title: "Could not strengthen translation reference",
			}),
		);
	});
});
