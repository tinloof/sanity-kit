import { useCallback, useEffect, useState } from "react";
import { SanityDocument, useFormValue } from "sanity";

import { PathnameInputProps, PathnamePrefix } from "../types";
import { usePathnameContext } from "./usePathnameContext";

/**
 * Returns the prefix specified on this pathname field, via options.prefix.
 * It can be a string, a function or a promise, and should resolve to a string.
 */
export function usePathnamePrefix(props: PathnameInputProps) {
  const sourceContext = usePathnameContext();
  const document = useFormValue([]) as SanityDocument | undefined;

  const optionsPrefix = props.schemaType.options?.prefix as
    | PathnamePrefix
    | undefined;

  const [urlPrefix, setUrlPrefix] = useState<string | undefined>();

  const getUrlPrefix = useCallback(
    async (doc: SanityDocument | undefined) => {
      if (!doc) return;

      if (typeof optionsPrefix === "string") {
        setUrlPrefix(optionsPrefix);
        return;
      }

      if (typeof optionsPrefix === "function") {
        try {
          const value = await Promise.resolve(
            optionsPrefix(doc, sourceContext)
          );
          setUrlPrefix(value);
          return;
        } catch (error) {
          console.error(
            `[prefixed-slug] Couldn't generate URL prefix: `,
            error
          );
        }
      }

      setUrlPrefix(window.location.origin);
    },
    [setUrlPrefix, optionsPrefix, sourceContext]
  );

  // Re-create the prefix whenever the document changes
  useEffect(() => {
    getUrlPrefix(document);
  }, [document, getUrlPrefix]);

  return {
    prefix: urlPrefix,
  };
}
