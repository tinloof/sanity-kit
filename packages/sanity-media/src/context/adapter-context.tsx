import {createContext, useContext, type ReactNode} from "react";
import type {StorageAdapter} from "../adapters";
import type {StorageCredentials} from "../storage-client";
import type {ImageTransformer} from "../types";

export interface AdapterContextValue {
	adapter: StorageAdapter;
	credentials: StorageCredentials | null;
	loading: boolean;
	imageTransformer?: ImageTransformer;
}

const AdapterContext = createContext<AdapterContextValue | null>(null);

export interface AdapterProviderProps {
	adapter: StorageAdapter;
	credentials: StorageCredentials | null;
	loading: boolean;
	imageTransformer?: ImageTransformer;
	children: ReactNode;
}

export function AdapterProvider({
	adapter,
	credentials,
	loading,
	imageTransformer,
	children,
}: AdapterProviderProps) {
	return (
		<AdapterContext.Provider
			value={{adapter, credentials, loading, imageTransformer}}
		>
			{children}
		</AdapterContext.Provider>
	);
}

export function useAdapter() {
	const context = useContext(AdapterContext);
	if (!context) {
		throw new Error("useAdapter must be used within AdapterProvider");
	}
	return context;
}
