import { useSecrets } from "@sanity/studio-secrets";
import { useEffect, useState } from "react";
import type { StorageAdapter } from "../adapters";
import type { StorageCredentials } from "../storage-client";

const SECRETS_NAMESPACE = "media-storage";

/**
 * Hook to load credentials from Sanity secrets
 */
export function useCredentials(adapter: StorageAdapter) {
  const { secrets, loading: secretsLoading } =
    useSecrets<Record<string, string>>(SECRETS_NAMESPACE);
  const [credentials, setCredentials] = useState<StorageCredentials | null>(
    null
  );

  useEffect(() => {
    if (secrets) {
      try {
        const creds = adapter.toCredentials(secrets);
        setCredentials(creds);
      } catch (error) {
        console.error("Failed to convert secrets to credentials:", error);
      }
    }
  }, [secrets, adapter]);

  return { credentials, loading: secretsLoading };
}
