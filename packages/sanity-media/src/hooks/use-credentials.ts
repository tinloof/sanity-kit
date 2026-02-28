import {useSecrets} from "@sanity/studio-secrets";
import {useEffect, useState} from "react";
import type {StorageAdapter} from "../adapters";
import type {StorageCredentials} from "../storage-client";

const SECRETS_NAMESPACE = "media-storage";

/**
 * Hook to load credentials from Sanity secrets
 */
export function useCredentials(adapter: StorageAdapter) {
	const {secrets, loading: secretsLoading} =
		useSecrets<Record<string, string>>(SECRETS_NAMESPACE);
	const [credentials, setCredentials] = useState<StorageCredentials | null>(
		null,
	);
	const [credentialsReady, setCredentialsReady] = useState(false);

	useEffect(() => {
		if (secrets) {
			try {
				const creds = adapter.toCredentials(secrets);
				setCredentials(creds);
				setCredentialsReady(true);
			} catch (error) {
				console.error("Failed to convert secrets to credentials:", error);
				setCredentialsReady(true); // Mark as ready even on error
			}
		} else if (!secretsLoading) {
			// Secrets finished loading but are null/undefined (not configured)
			setCredentialsReady(true);
		}
	}, [secrets, adapter, secretsLoading]);

	return {
		credentials,
		loading: secretsLoading || !credentialsReady,
	};
}
