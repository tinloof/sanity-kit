import {useSecrets} from "@sanity/studio-secrets";
import {useEffect, useMemo, useState} from "react";
import type {StorageAdapter} from "../adapters";
import type {StorageCredentials} from "../storage-client";

const SECRETS_NAMESPACE = "media-storage";

/**
 * Hook to load credentials from Sanity secrets
 */
export function useCredentials(adapter: StorageAdapter) {
	// Memoize adapter by id to prevent reference changes from causing infinite re-renders
	const stableAdapter = useMemo(() => adapter, [adapter.id]);

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
		let cancelled = false;

		// Reset state when adapter or secrets change
		setCredentials(null);
		setCredentialsReady(false);

		if (secrets) {
			try {
				const creds = stableAdapter.toCredentials(secrets);
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
				setCredentialsReady(true);
			}
		}

		return () => {
			cancelled = true;
		};
	}, [secrets, stableAdapter, secretsLoading]);

	return {
		credentials,
		loading: secretsLoading || !credentialsReady,
	};
}
