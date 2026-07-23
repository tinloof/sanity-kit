import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import {useRouter} from "sanity/router";
import type {MediaAsset} from "../components/media-panel/types";

// Session storage keys
const SELECTION_CONTEXT_KEY = "media-tool-selection-context";
const PENDING_SELECTION_PREFIX = "media-selection:";
const SELECTION_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface ReturnIntent {
	documentId: string;
	documentType: string;
	fieldPath: string;
	/** The full URL path the user was on when they clicked browse */
	sourceUrl: string;
}

export interface SelectionContextData {
	returnIntent: ReturnIntent;
	assetType: "image" | "video" | "file";
	timestamp: number;
}

export interface PendingSelection {
	assetId: string;
	timestamp: number;
}

export interface MediaSelectionContextValue {
	/** Whether we're currently in selection mode */
	isSelectionMode: boolean;
	/** The return intent containing document info */
	returnIntent: ReturnIntent | null;
	/** Asset type filter for selection */
	assetType: "image" | "video" | "file" | null;
	/** Enter selection mode and navigate to media tool */
	enterSelectionMode: (
		returnIntent: ReturnIntent,
		assetType: "image" | "video" | "file",
	) => void;
	/** Cancel selection and return to document */
	cancelSelection: () => void;
	/** Select an asset and return to document */
	selectAsset: (asset: MediaAsset) => void;
}

const MediaSelectionContext = createContext<MediaSelectionContextValue | null>(
	null,
);

// Utility functions for session storage
function getSelectionContext(): SelectionContextData | null {
	try {
		const data = sessionStorage.getItem(SELECTION_CONTEXT_KEY);
		if (!data) return null;

		const parsed = JSON.parse(data) as SelectionContextData;

		// Check if expired
		if (Date.now() - parsed.timestamp > SELECTION_TTL_MS) {
			sessionStorage.removeItem(SELECTION_CONTEXT_KEY);
			return null;
		}

		return parsed;
	} catch {
		return null;
	}
}

function setSelectionContext(data: SelectionContextData): void {
	sessionStorage.setItem(SELECTION_CONTEXT_KEY, JSON.stringify(data));
}

function clearSelectionContext(): void {
	sessionStorage.removeItem(SELECTION_CONTEXT_KEY);
}

function getPendingSelectionKey(documentId: string, fieldPath: string): string {
	return `${PENDING_SELECTION_PREFIX}${documentId}:${fieldPath}`;
}

export function setPendingSelection(
	documentId: string,
	fieldPath: string,
	assetId: string,
): void {
	const key = getPendingSelectionKey(documentId, fieldPath);
	const data: PendingSelection = {
		assetId,
		timestamp: Date.now(),
	};
	sessionStorage.setItem(key, JSON.stringify(data));
}

export function getPendingSelection(
	documentId: string,
	fieldPath: string,
): string | null {
	try {
		const key = getPendingSelectionKey(documentId, fieldPath);
		const data = sessionStorage.getItem(key);
		if (!data) return null;

		const parsed = JSON.parse(data) as PendingSelection;

		// Check if expired
		if (Date.now() - parsed.timestamp > SELECTION_TTL_MS) {
			sessionStorage.removeItem(key);
			return null;
		}

		return parsed.assetId;
	} catch {
		return null;
	}
}

export function clearPendingSelection(
	documentId: string,
	fieldPath: string,
): void {
	const key = getPendingSelectionKey(documentId, fieldPath);
	sessionStorage.removeItem(key);
}

// Cleanup expired pending selections on load
function cleanupExpiredSelections(): void {
	const keysToRemove: string[] = [];

	for (let i = 0; i < sessionStorage.length; i++) {
		const key = sessionStorage.key(i);
		if (key?.startsWith(PENDING_SELECTION_PREFIX)) {
			try {
				const data = sessionStorage.getItem(key);
				if (data) {
					const parsed = JSON.parse(data) as PendingSelection;
					if (Date.now() - parsed.timestamp > SELECTION_TTL_MS) {
						keysToRemove.push(key);
					}
				}
			} catch {
				keysToRemove.push(key);
			}
		}
	}

	keysToRemove.forEach((key) => sessionStorage.removeItem(key));
}

export interface MediaSelectionProviderProps {
	children: ReactNode;
}

export function MediaSelectionProvider({
	children,
}: MediaSelectionProviderProps) {
	const router = useRouter();
	const [selectionData, setSelectionData] =
		useState<SelectionContextData | null>(null);

	// Load selection context on mount
	useEffect(() => {
		cleanupExpiredSelections();
		const context = getSelectionContext();
		setSelectionData(context);
	}, []);

	const enterSelectionMode = useCallback(
		(returnIntent: ReturnIntent, assetType: "image" | "video" | "file") => {
			const data: SelectionContextData = {
				returnIntent,
				assetType,
				timestamp: Date.now(),
			};
			setSelectionContext(data);
			setSelectionData(data);

			// Navigate to media tool
			router.navigateUrl({path: "/media"});
		},
		[router],
	);

	const cancelSelection = useCallback(() => {
		const data = selectionData;
		clearSelectionContext();
		setSelectionData(null);

		if (data?.returnIntent?.sourceUrl) {
			// Navigate back to the original URL the user was on using the router
			// to avoid full page reloads and preserve unsaved state
			router.navigateUrl({path: data.returnIntent.sourceUrl});
		}
	}, [selectionData, router]);

	const selectAsset = useCallback(
		(asset: MediaAsset) => {
			const data = selectionData;
			if (!data?.returnIntent?.sourceUrl) return;

			// Store pending selection for the input component to pick up
			// Normalize document ID by removing drafts. prefix for consistent matching
			const normalizedDocId = data.returnIntent.documentId.replace(
				/^drafts\./,
				"",
			);
			setPendingSelection(
				normalizedDocId,
				data.returnIntent.fieldPath,
				asset._id,
			);

			// Clear selection mode
			clearSelectionContext();
			setSelectionData(null);

			// Navigate back to the original URL the user was on using the router
			// to avoid full page reloads and preserve unsaved state
			router.navigateUrl({path: data.returnIntent.sourceUrl});
		},
		[selectionData, router],
	);

	const value: MediaSelectionContextValue = {
		isSelectionMode: selectionData !== null,
		returnIntent: selectionData?.returnIntent ?? null,
		assetType: selectionData?.assetType ?? null,
		enterSelectionMode,
		cancelSelection,
		selectAsset,
	};

	return (
		<MediaSelectionContext.Provider value={value}>
			{children}
		</MediaSelectionContext.Provider>
	);
}

export function useMediaSelection(): MediaSelectionContextValue {
	const context = useContext(MediaSelectionContext);
	if (!context) {
		throw new Error(
			"useMediaSelection must be used within MediaSelectionProvider",
		);
	}
	return context;
}

// Hook for input components to check for pending selection
export function usePendingSelection(
	documentId: string | undefined,
	fieldPath: string,
): {
	pendingAssetId: string | null;
	clearPending: () => void;
} {
	const [pendingAssetId, setPendingAssetId] = useState<string | null>(null);

	useEffect(() => {
		if (documentId) {
			const assetId = getPendingSelection(documentId, fieldPath);
			setPendingAssetId(assetId);
		}
	}, [documentId, fieldPath]);

	const clearPending = useCallback(() => {
		if (documentId) {
			clearPendingSelection(documentId, fieldPath);
			setPendingAssetId(null);
		}
	}, [documentId, fieldPath]);

	return {pendingAssetId, clearPending};
}
