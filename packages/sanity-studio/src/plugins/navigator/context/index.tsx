import {localizePathname} from "@tinloof/sanity-web";
import type React from "react";
import {createContext, useContext, useEffect, useMemo, useReducer} from "react";
import {type DocumentDefinition, useSchema} from "sanity";

import type {
	NavigatorContextType,
	Page,
	PagesNavigatorOptions,
	PathnameOptions,
	ReducerAction,
	Tree,
	TreeNode,
} from "../../../types";
import {buildTree, findTreeByPath} from "../utils";

const CURRENT_DIR_PARAM = "sw-dir";
const CURRENT_LOCALE_PARAM = "sw-locale";

type State = Pick<
	NavigatorContextType,
	"currentDir" | "locale" | "defaultLocaleId" | "searchTerm"
>;

const NavigatorContext = createContext<NavigatorContextType>({
	rootTree: {},
	currentDir: "",
	setCurrentDir: () => {},
	searchTerm: "",
	handleSearch: () => {},
	locale: undefined,
	defaultLocaleId: undefined,
	localizePathname: localizePathname,
	setLocale: () => {},
	folders: {},
	items: [],
});

const actionTypes = {
	SET_CURRENT_DIR: "SET_CURRENT_DIR",
	SET_CONTENT_TREE: "SET_CONTENT_TREE",
	SET_SEARCH_TERM: "SET_SEARCH_TERM",
	SET_LOCALE: "SET_LOCALE",
	REFRESH_TREE: "REFRESH_TREE",
};

function reducer(state: State, action: ReducerAction) {
	switch (action.type) {
		case actionTypes.SET_CURRENT_DIR:
			return {...state, currentDir: action.payload};
		case actionTypes.SET_CONTENT_TREE:
			return {...state, rootTree: action.payload};
		case actionTypes.SET_SEARCH_TERM:
			return {...state, searchTerm: action.payload};
		case actionTypes.SET_LOCALE:
			return {
				...state,
				locale: action.payload,
			};
		case actionTypes.REFRESH_TREE:
			return {...state, rootTree: {}};

		default:
			return state;
	}
}

export const NavigatorProvider = ({
	data,
	i18n,
	folders,
	children,
}: {
	i18n?: PagesNavigatorOptions["i18n"];
	folders?: PagesNavigatorOptions["folders"];
	data: Page[];
	children: React.ReactNode;
}) => {
	const i18nEnabled = i18n?.locales?.length;
	const initialLocaleId = i18nEnabled
		? (i18n.defaultLocaleId ?? i18n.locales[0].id)
		: undefined;
	const initialState: State = {
		currentDir:
			new URLSearchParams(window.location.search).get(CURRENT_DIR_PARAM) ?? "",
		searchTerm: "",
		locale: !i18nEnabled
			? undefined
			: (new URLSearchParams(window.location.search).get(
					CURRENT_LOCALE_PARAM,
				) ?? initialLocaleId),
	};

	const [state, dispatch] = useReducer(reducer, initialState);
	const schema = useSchema();

	// Extract documents with pathname prefix
	const typeToPrefixMap = useMemo(() => {
		const prefixMap = new Map<string, string>();
		const schemaTypes = schema._original?.types;
		if (!schemaTypes) return prefixMap;

		for (const type of schemaTypes) {
			const isDocumentType =
				"type" in type &&
				type.type === "document" &&
				"fields" in type &&
				Array.isArray(type.fields);
			if (!isDocumentType) continue;

			const documentType = type as DocumentDefinition;
			const pathnameField = documentType.fields?.find(
				(field) => field.name === "pathname",
			);
			const options = pathnameField?.options as PathnameOptions | undefined;
			if (options?.prefix && typeof options.prefix === "string") {
				// Normalize prefix (remove leading/trailing slashes) once when storing
				const normalizedPrefix = options.prefix.replace(/^\/+|\/+$/g, "");
				prefixMap.set(documentType.name, normalizedPrefix);
			}
		}
		return prefixMap;
	}, [schema._original?.types]);

	/**
	 * Applies a normalized prefix to a pathname.
	 * @param prefix - Already normalized prefix (no leading/trailing slashes)
	 */
	function applyPathnamePrefix(
		pathname: string | undefined | null,
		prefix: string,
	): string {
		if (!pathname || pathname.trim() === "") {
			return `/${prefix}`;
		}

		if (!prefix) {
			return pathname.startsWith("/") ? pathname : `/${pathname}`;
		}

		// Normalize pathname (ensure it starts with /, remove trailing slashes)
		const normalizedPathname = pathname
			.replace(/\/+$/, "")
			.replace(/^\/+/, "/");

		// Check if pathname already contains the prefix to avoid double prefixing
		const pathnameWithoutLeadingSlash = normalizedPathname.slice(1);
		if (
			pathnameWithoutLeadingSlash === prefix ||
			pathnameWithoutLeadingSlash.startsWith(`${prefix}/`)
		) {
			return normalizedPathname;
		}

		// Handle root pathname
		if (normalizedPathname === "/") {
			return `/${prefix}`;
		}

		// Combine prefix and pathname, ensuring single slashes
		return `/${prefix}${normalizedPathname}`;
	}

	// Apply prefixes to pathnames before building tree
	const dataWithPrefixes = useMemo(() => {
		return data.map((page) => {
			const prefix = typeToPrefixMap.get(page._type);
			if (prefix && page.pathname) {
				return {
					...page,
					pathname: applyPathnamePrefix(page.pathname, prefix),
				};
			}
			return page;
		});
	}, [data, typeToPrefixMap]);

	const filteredData = useMemo(() => {
		return i18nEnabled
			? dataWithPrefixes.filter(
					(page) =>
						page.locale === state.locale ||
						(!page.locale && i18n.requireLocale === false),
				)
			: dataWithPrefixes;
	}, [dataWithPrefixes, i18nEnabled, state.locale, i18n?.requireLocale]);

	const rootTree = searchTree({
		tree: buildTree(filteredData),
		searchTerm: state.searchTerm,
	});

	function handleSearch(input: string) {
		dispatch({type: actionTypes.SET_SEARCH_TERM, payload: input});
	}

	const actions = {
		setCurrentDir: (dir: string) => {
			dispatch({type: actionTypes.SET_CURRENT_DIR, payload: dir});
			const url = new URL(window.location.href);
			if (dir !== "") {
				url.searchParams.set(CURRENT_DIR_PARAM, dir);
			} else {
				url.searchParams.delete(CURRENT_DIR_PARAM);
			}
			window.history.pushState({}, "", url);
		},
		setLocale: (locale: string) => {
			dispatch({type: actionTypes.SET_LOCALE, payload: locale});
			const url = new URL(window.location.href);
			if (locale && locale !== initialLocaleId) {
				url.searchParams.set(CURRENT_LOCALE_PARAM, locale);
			} else {
				url.searchParams.delete(CURRENT_LOCALE_PARAM);
			}
			window.history.pushState({}, "", url);
			actions.setCurrentDir("");
		},
		handleSearch,
	};

	const targetTree = findTreeByPath(rootTree, state.currentDir);
	const currentTree = targetTree || rootTree;
	const items = Object.values(currentTree || rootTree).sort((a, b) =>
		a.pathname && b.pathname ? a.pathname.localeCompare(b.pathname) : 0,
	);

	useEffect(() => {
		if (!targetTree && state.currentDir) {
			actions.setCurrentDir("");
		}
	}, [targetTree, initialState.currentDir]);

	return (
		<NavigatorContext.Provider
			value={{
				items,
				defaultLocaleId: i18n?.defaultLocaleId,
				localizePathname: i18n?.localizePathname || localizePathname,
				folders,
				rootTree,
				...state,
				...actions,
			}}
		>
			{children}
		</NavigatorContext.Provider>
	);
};

export const useNavigator = () => useContext(NavigatorContext);

function searchTree({
	tree: root,
	searchTerm,
}: {
	tree: Tree;
	searchTerm: string;
}) {
	const q = searchTerm.toLowerCase().trim();
	if (!q) return root;
	const searchResults: Tree = {};

	function searchInTree(tree: Tree) {
		for (const key in tree) {
			if (!Object.hasOwn(tree, key)) continue;
			const item: TreeNode = tree[key];
			if (
				item.title.toLowerCase().startsWith(q) ||
				item.pathname?.toLowerCase().startsWith(q) ||
				item.title
					.split(" ")
					.some((word) => word.toLowerCase().startsWith(q)) ||
				item.pathname
					?.toLowerCase()
					.split("/")
					.some((word) => {
						return word.startsWith(q);
					})
			) {
				searchResults[key] = item;
			}

			if (item.children) {
				searchInTree(item.children);
			}
		}
	}

	searchInTree(root);

	return searchResults;
}
