import type {
  ArbitraryTypedObject,
  PortableTextBlock,
} from "@portabletext/types";
import {getDeepLinkID} from "../utils/ids";
import React from "react";

// Common props that all section components receive
export type BaseSectionProps = {
  _key: string;
  _type: string;
  _sectionIndex: number;
  _sections: SectionData[];
  rootHtmlAttributes: {
    "data-section": string;
    id: string;
  };
};

// Type for individual section data
export type SectionData = ArbitraryTypedObject | PortableTextBlock;

// Enhanced component type
export type SectionComponent<T = Record<string, any>> = React.ComponentType<
  T & BaseSectionProps
>;

// Component map type
export type SectionComponentMap = Record<string, SectionComponent>;

export type SectionsRendererProps = {
  /** Field name used for generating deep link IDs */
  fieldName?: string;
  /** Array of section data objects to render */
  sectionsData?: SectionData[];
  /** Map of section type strings to their React components */
  sectionComponentMap: SectionComponentMap;
  /** Optional container class name (default: "space-y-0.5") */
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
 *   fieldName="sections"
 *   sectionsData={pageData.sections}
 *   sectionComponentMap={{
 *     "section.hero": HeroSection,
 *     "section.cta": CallToAction,
 *   }}
 *   fallbackComponent={({ type, availableTypes }) => (
 *     <div>Missing component for: {type}</div>
 *   )}
 * />
 * ```
 */
export default function SectionsRenderer({
  fieldName = "sections",
  sectionsData,
  sectionComponentMap,
  className,
  fallbackComponent,
  showDevWarnings = process.env.NODE_ENV === "development",
}: SectionsRendererProps) {
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
        const Component = sectionComponentMap[section._type];

        // Handle missing component
        if (!Component) {
          if (showDevWarnings) {
            const available = Object.keys(sectionComponentMap);
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
                  availableTypes: Object.keys(sectionComponentMap),
                })}
              </React.Fragment>
            );
          }

          return (
            <MissingSection
              key={section._key || `missing-${index}`}
              type={section._type}
              availableTypes={Object.keys(sectionComponentMap)}
            />
          );
        }

        const sectionKey = section._key || `section-${index}`;

        return (
          <Component
            key={sectionKey}
            {...section}
            _sectionIndex={index}
            _sections={sectionsData}
            rootHtmlAttributes={{
              "data-section": section._type,
              id: getDeepLinkID({sectionKey, fieldName}),
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

export type SectionsRendererConfig = Pick<
  SectionsRendererProps,
  "className" | "fallbackComponent" | "sectionComponentMap" | "showDevWarnings"
>;

export type ConfiguredSectionsRendererProps = Pick<
  SectionsRendererProps,
  "fieldName" | "sectionsData"
>;

/**
 * Factory function to create a pre-configured SectionsRenderer.
 * Allowing you to configure the renderer once
 * and reuse it throughout your app with minimal props.
 *
 * @example
 * ```tsx
 * // Configure once in your app
 * const ConfiguredSectionsRenderer = createSectionsRenderer({
 *   sectionComponentMap: {
 *     "section.hero": HeroSection,
 *     "section.cta": CallToAction,
 *   },
 *   className: "space-y-8",
 *   showDevWarnings: true,
 *   fallbackComponent: ({ type, availableTypes }) => (
 *     <div>Custom fallback for: {type}</div>
 *   ),
 * });
 *
 * // Use in pages with minimal props
 * <ConfiguredSectionsRenderer
 *   fieldName="sections"
 *   sectionsData={pageData.sections}
 * />
 * ```
 */
export function createSectionsRenderer(config: SectionsRendererConfig) {
  return function ConfiguredSectionsRenderer({
    fieldName,
    sectionsData,
  }: ConfiguredSectionsRendererProps) {
    return (
      <SectionsRenderer
        fieldName={fieldName}
        sectionsData={sectionsData}
        sectionComponentMap={config.sectionComponentMap}
        className={config.className}
        fallbackComponent={config.fallbackComponent}
        showDevWarnings={config.showDevWarnings}
      />
    );
  };
}
