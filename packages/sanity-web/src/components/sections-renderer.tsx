import type {
	ArbitraryTypedObject,
	PortableTextBlock,
} from "@portabletext/types";
import type {ComponentProps, ComponentType} from "react";
import React from "react";

// Type for individual section data
export type SectionData = ArbitraryTypedObject | PortableTextBlock;

// Extract the _type union from a sections array type
type ExtractSectionTypes<TSections extends readonly any[]> =
	TSections[number]["_type"];

// Extract a specific section by its _type
type ExtractSectionByType<
	TSections extends readonly any[],
	TType extends string,
> = Extract<TSections[number], {_type: TType}>;

// Base props that all section components receive from the renderer
export type BaseSectionProps<
	TSections extends readonly any[] = any[],
	TSharedProps extends Record<string, any> = {},
> = {
	_key: string;
	_sectionIndex: number;
	_sections: TSections;
	rootHtmlAttributes: {
		"data-section": string;
		id: string;
	};
} & TSharedProps;

// Props for a specific section component
export type SectionProps<
	TSections extends readonly any[],
	TType extends ExtractSectionTypes<TSections>,
	TSharedProps extends Record<string, any> = {},
> = ExtractSectionByType<TSections, TType> &
	BaseSectionProps<TSections, TSharedProps>;

// Component type for a specific section
export type SectionComponent<
	TSections extends readonly any[],
	TType extends ExtractSectionTypes<TSections>,
	TSharedProps extends Record<string, any> = {},
> = React.ComponentType<SectionProps<TSections, TType, TSharedProps>>;

// Type-safe component map
export type SectionComponentMap<
	TSections extends readonly any[],
	TSharedProps extends Record<string, any> = {},
> = {
	[K in ExtractSectionTypes<TSections>]?: SectionComponent<
		TSections,
		K,
		TSharedProps
	>;
};

// Loose component map that accepts any value - useful for avoiding circular deps
type SectionComponentMapLoose<TSections extends readonly any[]> = {
	[K in ExtractSectionTypes<TSections>]?: unknown;
};

export type SectionsRendererProps<
	TSections extends readonly any[] = any[],
	TSharedProps extends Record<string, any> = {},
> = {
	/** Array of section data objects to render */
	data?: TSections;
	/**
	 * @deprecated Use `data` instead
	 */
	sectionsData?: TSections;
	/** Map of section type strings to their React components */
	components: SectionComponentMap<TSections, TSharedProps>;
	/**
	 * @deprecated Use `components` instead
	 */
	sectionComponentMap?: never;
	/** Props shared across all section components */
	sharedProps?: TSharedProps;
	/** Optional container class name */
	className?: string;
	/** Custom fallback component for missing section types */
	fallbackComponent?: (props: {
		type: string;
		availableTypes: string[];
	}) => React.ReactNode;
	/** Show dev warnings for missing components (default: true in dev) */
	showDevWarnings?: boolean;
	/**
	 * @deprecated This field is no longer used
	 */
	fieldName?: never;
};

/**
 * Renders sections dynamically based on their _type field.
 * Each section component receives standard props plus its own data.
 *
 * @example
 * ```tsx
 * <SectionsRenderer
 *   data={pageData.sections}
 *   components={{
 *     "section.hero": HeroSection,
 *     "section.cta": CallToAction,
 *   }}
 *   sharedProps={{ locale: "en" }}
 *   fallbackComponent={({ type, availableTypes }) => (
 *     <div>Missing component for: {type}</div>
 *   )}
 * />
 * ```
 */
export default function SectionsRenderer<
	TSections extends readonly any[] = any[],
	TSharedProps extends Record<string, any> = {},
>({
	data,
	sectionsData,
	components,
	sharedProps,
	className,
	fallbackComponent,
	showDevWarnings = process.env.NODE_ENV === "development",
}: SectionsRendererProps<TSections, TSharedProps>) {
	// Support both `data` and deprecated `sectionsData`
	const resolvedData = data ?? sectionsData;

	if (sectionsData !== undefined && process.env.NODE_ENV === "development") {
		console.warn(
			"[SectionsRenderer] `sectionsData` is deprecated. Use `data` instead.",
		);
	}

	// Early return if no sections
	if (!resolvedData?.length) {
		return null;
	}

	return (
		<div className={className}>
			{resolvedData.map((section, index) => {
				// Skip invalid sections
				if (!section?._type) {
					if (showDevWarnings) {
						console.warn(
							`[SectionsRenderer] Section at index ${index} missing _type:`,
							section,
						);
					}
					return null;
				}

				// Get component
				const Component = components[
					section._type as ExtractSectionTypes<TSections>
				] as React.ComponentType<any> | undefined;

				// Handle missing component
				if (!Component) {
					if (showDevWarnings) {
						const available = Object.keys(components);
						console.warn(
							`[SectionsRenderer] Missing component for "${section._type}". Available: ${available.join(", ")}`,
						);
					}

					// Use fallback component if provided, otherwise use default MissingSection
					if (fallbackComponent) {
						return (
							<React.Fragment key={section._key || `missing-${index}`}>
								{fallbackComponent({
									type: section._type,
									availableTypes: Object.keys(components),
								})}
							</React.Fragment>
						);
					}

					return (
						<MissingSection
							key={section._key || `missing-${index}`}
							type={section._type}
							availableTypes={Object.keys(components)}
						/>
					);
				}

				const sectionKey = section._key || `section-${index}`;

				return (
					<Component
						key={sectionKey}
						{...section}
						{...sharedProps}
						_key={sectionKey}
						_sectionIndex={index}
						_sections={resolvedData}
						rootHtmlAttributes={{
							"data-section": section._type,
							id: sectionKey,
						}}
					/>
				);
			})}
		</div>
	);
}

type MissingSectionProps = {
	type: string;
	availableTypes: string[];
};

// Fallback component shown when section type is not found
function MissingSection({type, availableTypes}: MissingSectionProps) {
	const isDev = process.env.NODE_ENV === "development";

	return (
		<section
			style={{width: "100%", backgroundColor: "#000000", color: "#ffffff"}}
		>
			<div
				style={{
					maxWidth: "1200px",
					margin: "0 auto",
					padding: "2rem 1rem",
					textAlign: "center",
				}}
			>
				<div
					style={{
						borderRadius: "6px",
						border: "2px dashed #ffffff",
						padding: "2.5rem 1.25rem",
					}}
				>
					<h2
						style={{
							fontSize: "1.125rem",
							fontWeight: "600",
							marginBottom: "0.5rem",
						}}
					>
						Missing Section Component
					</h2>
					<p style={{marginBottom: "1rem"}}>
						No component found for section type{" "}
						<code
							style={{
								padding: "0.25rem 0.5rem",
								backgroundColor: "#fef2f2",
								borderRadius: "0.25rem",
								fontSize: "0.875rem",
								fontFamily: "monospace",
								color: "#000000",
							}}
						>
							{type}
						</code>
					</p>

					{isDev && availableTypes.length > 0 && (
						<details
							style={{
								display: "inline-block",
								textAlign: "left",
								backgroundColor: "#ffffff",
								padding: "1rem",
								borderRadius: "0.25rem",
								border: "1px solid #e5e7eb",
								color: "#000000",
							}}
						>
							<summary
								style={{
									cursor: "pointer",
									fontWeight: "500",
									color: "#dc2626",
								}}
							>
								View available types ({availableTypes.length})
							</summary>
							<ul
								style={{
									marginTop: "0.75rem",
									fontSize: "0.875rem",
									fontFamily: "monospace",
									color: "#374151",
									maxHeight: "12rem",
									overflowY: "auto",
								}}
							>
								{availableTypes.map((availableType) => (
									<li
										key={availableType}
										style={{
											display: "flex",
											alignItems: "center",
											marginBottom: "0.25rem",
										}}
									>
										<span
											style={{
												width: "0.5rem",
												height: "0.5rem",
												backgroundColor: "#9ca3af",
												borderRadius: "50%",
												marginRight: "0.75rem",
											}}
										/>
										{availableType}
									</li>
								))}
							</ul>
						</details>
					)}
				</div>
			</div>
		</section>
	);
}

export type SectionsRendererConfig<
	TSections extends readonly any[],
	TSharedProps extends Record<string, any> = {},
> = {
	components: SectionComponentMapLoose<TSections>;
	className?: string;
	fallbackComponent?: SectionsRendererProps<
		TSections,
		TSharedProps
	>["fallbackComponent"];
	showDevWarnings?: boolean;
};

export type ConfiguredSectionsRendererProps<
	TSections extends readonly any[],
	TSharedProps extends Record<string, any> = {},
> = (keyof TSharedProps extends never
	? {sharedProps?: TSharedProps}
	: {sharedProps: TSharedProps}) & {
	/** Array of section data objects to render */
	data?: TSections;
	/**
	 * @deprecated Use `data` instead
	 */
	sectionsData?: TSections;
};

/**
 * Factory function to create a pre-configured, type-safe SectionsRenderer.
 * Pass the sections array type as a generic to get full type inference
 * for section components and their props.
 *
 * @example
 * ```tsx
 * // components/sections/index.ts
 * import { createSectionsComponent } from "@tinloof/sanity-web/components";
 * import type { PAGE_QUERYResult } from "@/sanity/types";
 * import HeroSection from "./hero-section";
 * import CallToAction from "./call-to-action";
 *
 * // Create the sections renderer
 * const Sections = createSectionsComponent<
 *   NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>,
 *   { locale: string }
 * >({
 *   components: {
 *     "section.hero": HeroSection,
 *     "section.cta": CallToAction,
 *   },
 * });
 *
 * // Infer SectionProps directly from the Sections component
 * type SectionProps = (typeof Sections)["_SectionProps"];
 *
 * export { Sections, type SectionProps };
 *
 * // components/sections/hero-section.tsx
 * import type { SectionProps } from ".";
 *
 * export default function HeroSection(props: SectionProps["section.hero"]) {
 *   const { title, locale } = props;
 *   return <section><h1>{title}</h1></section>;
 * }
 *
 * // pages/[slug].tsx
 * import { Sections } from "@/components/sections";
 *
 * export default function Page({ sections, locale }) {
 *   return <Sections data={sections} sharedProps={{ locale }} />;
 * }
 * ```
 *
 * Section components receive their specific section data plus these additional props:
 * - `_key`: Unique key for the section
 * - `_sectionIndex`: Index of the section in the array
 * - `_sections`: The full sections array
 * - `rootHtmlAttributes`: Object with `data-section` and `id` for deep linking
 * - Plus any shared props passed to the renderer
 */
// Type for the section props map attached to the configured renderer
type SectionPropsMap<
	TSections extends readonly any[],
	TSharedProps extends Record<string, any> = {},
> = {
	[K in TSections[number]["_type"]]: SectionProps<TSections, K, TSharedProps>;
};

export function createSectionsComponent<
	TSections extends readonly any[],
	TSharedProps extends Record<string, any> = {},
>(config: SectionsRendererConfig<TSections, TSharedProps>) {
	function ConfiguredSectionsRenderer({
		data,
		sectionsData,
		sharedProps,
	}: ConfiguredSectionsRendererProps<TSections, TSharedProps>) {
		// Support both `data` and deprecated `sectionsData`
		const resolvedData = data ?? sectionsData;

		if (sectionsData !== undefined && process.env.NODE_ENV === "development") {
			console.warn(
				"[SectionsRenderer] `sectionsData` is deprecated. Use `data` instead.",
			);
		}

		return (
			<SectionsRenderer<TSections, TSharedProps>
				data={resolvedData}
				components={
					config.components as unknown as SectionComponentMap<
						TSections,
						TSharedProps
					>
				}
				sharedProps={sharedProps as TSharedProps}
				className={config.className}
				fallbackComponent={config.fallbackComponent}
				showDevWarnings={config.showDevWarnings}
			/>
		);
	}

	// Attach the section props type to the component for easy access
	ConfiguredSectionsRenderer._SectionProps = {} as SectionPropsMap<
		TSections,
		TSharedProps
	>;

	return ConfiguredSectionsRenderer;
}

/**
 * @deprecated Use `createSectionsComponent` instead
 */
export const createSectionsRenderer = createSectionsComponent;

/**
 * @deprecated Use `createSectionsComponent` instead
 */
export const createSections = createSectionsComponent;

/**
 * Utility type to infer section props from a configured SectionsRenderer.
 * This allows you to derive the props type for each section directly from
 * the renderer without manually specifying the types.
 *
 * Note: Prefer using the `_SectionProps` property on the Sections component instead:
 * ```tsx
 * type SectionProps = (typeof Sections)["_SectionProps"];
 * ```
 *
 * @example
 * ```tsx
 * import { createSectionsComponent, InferSectionProps } from "@tinloof/sanity-web";
 *
 * const Sections = createSectionsComponent<Sections, SharedProps>({
 *   components: {
 *     "section.hero": HeroSection,
 *     "section.cta": CallToAction,
 *   },
 * });
 *
 * // Infer props from the renderer (alternative to _SectionProps)
 * type SectionProps = InferSectionProps<typeof Sections>;
 *
 * // Use in components
 * function HeroSection(props: SectionProps["section.hero"]) {
 *   // ...
 * }
 * ```
 */
export type InferSectionProps<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends ComponentType<any>,
> = {
	[K in NonNullable<ComponentProps<T>["data"]>[number]["_type"]]: SectionProps<
		NonNullable<ComponentProps<T>["data"]>,
		K,
		ComponentProps<T>["sharedProps"]
	>;
};
