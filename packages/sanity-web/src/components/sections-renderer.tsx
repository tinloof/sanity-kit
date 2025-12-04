import type {
	ArbitraryTypedObject,
	PortableTextBlock,
} from "@portabletext/types";
import React from "react";
import { getDeepLinkID } from "../utils/ids";

// Type for individual section data
export type SectionData = ArbitraryTypedObject | PortableTextBlock;

// Extract the _type union from a sections array type
type ExtractSectionTypes<TSections extends readonly any[]> =
	TSections[number]["_type"];

// Extract a specific section by its _type
type ExtractSectionByType<
	TSections extends readonly any[],
	TType extends string,
> = Extract<TSections[number], { _type: TType }>;

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

export type SectionsRendererProps<
	TSections extends readonly any[] = any[],
	TSharedProps extends Record<string, any> = {},
> = {
	/** Array of section data objects to render */
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
};

/**
 * Renders sections dynamically based on their _type field.
 * Each section component receives standard props plus its own data.
 *
 * @example
 * ```tsx
 * <SectionsRenderer
 *   sectionsData={pageData.sections}
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
	sectionsData,
	components,
	sharedProps,
	className,
	fallbackComponent,
	showDevWarnings = process.env.NODE_ENV === "development",
}: SectionsRendererProps<TSections, TSharedProps>) {
	// Early return if no sections
	if (!sectionsData?.length) {
		return null;
	}

	return (
		<div className={className}>
			{sectionsData.map((section, index) => {
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
						_sections={sectionsData}
						rootHtmlAttributes={{
							"data-section": section._type,
							id: getDeepLinkID({ sectionKey }),
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
function MissingSection({ type, availableTypes }: MissingSectionProps) {
	const isDev = process.env.NODE_ENV === "development";

	return (
		<section
			style={{ width: "100%", backgroundColor: "#000000", color: "#ffffff" }}
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
					<p style={{ marginBottom: "1rem" }}>
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
> = Pick<
	SectionsRendererProps<TSections, TSharedProps>,
	"className" | "fallbackComponent" | "components" | "showDevWarnings"
>;

export type ConfiguredSectionsRendererProps<
	TSections extends readonly any[],
	TSharedProps extends Record<string, any> = {},
> = (keyof TSharedProps extends never
	? { sharedProps?: TSharedProps }
	: { sharedProps: TSharedProps }) & {
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
 * import {PAGE_QUERYResult} from "@/sanity/types";
 *
 * type Sections = NonNullable<PAGE_QUERYResult>["sections"];
 * type SharedProps = { locale: string; isPreview: boolean };
 *
 * // Create a type-safe renderer - TypeScript ensures each component
 * // receives the correct props based on its section type
 * export const SectionsRenderer = createSections<Sections, SharedProps>({
 *   components: {
 *     "section.hero": HeroSection,    // Must accept hero section props + SharedProps
 *     "section.cta": CallToAction,    // Must accept CTA section props + SharedProps
 *   },
 *   className: "space-y-8",
 * });
 *
 * // Use in pages with minimal props
 * <SectionsRenderer
 *   data={pageData.sections}
 *   sharedProps={{ locale: "en", isPreview: false }}
 * />
 * ```
 *
 * Section components receive their specific section data plus these additional props:
 * - `_key`: Unique key for the section
 * - `_sectionIndex`: Index of the section in the array
 * - `_sections`: The full sections array
 * - `rootHtmlAttributes`: Object with `data-section` and `id` for deep linking
 * - Plus any shared props passed to the renderer
 */
export function createSections<
	TSections extends readonly any[],
	TSharedProps extends Record<string, any> = {},
>(config: SectionsRendererConfig<TSections, TSharedProps>) {
	return function ConfiguredSectionsRenderer({
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
				sectionsData={resolvedData}
				components={config.components}
				sharedProps={sharedProps as TSharedProps}
				className={config.className}
				fallbackComponent={config.fallbackComponent}
				showDevWarnings={config.showDevWarnings}
			/>
		);
	};
}

/**
 * @deprecated Use `createSections` instead
 */
export const createSectionsRenderer = createSections;
