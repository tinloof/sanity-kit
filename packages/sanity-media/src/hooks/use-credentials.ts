import {useSecrets} from "@sanity/studio-secrets";
import {useEffect, useState} from "react";
import type {StorageAdapter} from "../adapters";
import type {StorageCredentials} from "../storage-client";

const SECRETS_NAMESPACE = "media-storage";

/**
 * Hook to load credentials from Sanity secrets
 *
 * @param adapter - Storage adapter containing credential conversion logic
 * @returns Object with credentials, loading state, and ready flag
 *   - credentials: Converted credentials or null if not ready/failed/presigned mode
 *   - loading: true while fetching secrets or converting to credentials (false in presigned mode)
 *   - ready: true when credentials loaded successfully OR adapter uses presigned URLs
 */
export function useCredentials(adapter: StorageAdapter) {
	// Always call useSecrets (can't conditionally call hooks)
	const {secrets, loading: secretsLoading} =
		useSecrets<Record<string, string>>(SECRETS_NAMESPACE);
	const [credentials, setCredentials] = useState<StorageCredentials | null>(
		null,
	);
	/**
	 * Tracks whether credentials have been processed after secrets load.
	 * Prevents showing UI before credentials are converted from secrets.
	 */
	const [credentialsReady, setCredentialsReady] = useState(false);

	useEffect(() => {
		// In presigned mode, skip credential conversion entirely
		if (adapter.presign) return;

		let cancelled = false;

		if (secrets && adapter.toCredentials) {
			try {
				const creds = adapter.toCredentials(secrets);
				if (!cancelled) {
					setCredentials(creds);
					setCredentialsReady(true);
				}
			} catch (error) {
				console.error("Failed to convert secrets to credentials:", error);
				if (!cancelled) {
					setCredentials(null);
					setCredentialsReady(true); // Mark as ready even on error
				}
			}
		} else if (!secretsLoading) {
			// Secrets finished loading but are null/undefined (not configured)
			if (!cancelled) {
				setCredentials(null);
				setCredentialsReady(true);
			}
		}

		return () => {
			cancelled = true;
		};
	}, [secrets, adapter, secretsLoading]);

	return {
		credentials,
		loading: adapter.presign ? false : secretsLoading || !credentialsReady,
		ready: !!adapter.presign || !!credentials,
	};
}
