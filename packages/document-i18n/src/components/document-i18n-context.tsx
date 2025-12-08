import { createContext, useContext } from "react";
import { type LayoutProps, useClient, useWorkspace } from "sanity";
import { suspend } from "suspend-react";

import { DEFAULT_CONFIG } from "../constants";
import type { PluginConfig, PluginConfigContext } from "../types";

const DocumentI18nContext = createContext<PluginConfigContext>(DEFAULT_CONFIG);

export function useDocumentI18nContext() {
	return useContext(DocumentI18nContext);
}

type DocumentI18nProviderProps = LayoutProps & {
	pluginConfig: Required<PluginConfig>;
};

/**
 * This Provider wraps the Studio and provides the DocumentI18n context to document actions and components.
 */
export function DocumentI18nProvider(props: DocumentI18nProviderProps) {
	const { pluginConfig } = props;

	const client = useClient({ apiVersion: pluginConfig.apiVersion });
	const workspace = useWorkspace();
	const locales = Array.isArray(pluginConfig.locales)
		? pluginConfig.locales
		: // eslint-disable-next-line require-await
			suspend(async () => {
				if (typeof pluginConfig.locales === "function") {
					return pluginConfig.locales(client);
				}
				return pluginConfig.locales;
			}, [workspace]);

	return (
		<DocumentI18nContext.Provider value={{ ...pluginConfig, locales }}>
			{props.renderDefault(props)}
		</DocumentI18nContext.Provider>
	);
}
