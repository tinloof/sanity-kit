import React from "react";
import { Schema, useSchema } from "sanity";

import { PagesNavigatorOptions } from "../../../types";
import { NavigatorProvider } from "../context";
import { useSanityFetch } from "../utils";
import Header from "./Header";
import { List } from "./List";
import LocaleSelect from "./LocaleSelect";
import SearchBox from "./SearchBox";
import ThemeProvider from "./ThemeProvider";

export function createPagesNavigator(props: PagesNavigatorOptions) {
  return function PagesNavigator() {
    return <DefaultPagesNavigator {...props} />;
  };
}

function DefaultPagesNavigator(props: PagesNavigatorOptions) {
  const schema = useSchema();
  const previewFragment = resolvePreviewFragment(schema);
  const pagesRoutesQuery = `
  *[pathname.current != null]{
    _id,
    _originalId,
    _type,
    _updatedAt,
    _createdAt,
    'pathname': pathname.current,
    locale,
    ${previewFragment || ""}
  }
`;

  const [data, loading] = useSanityFetch({
    query: pagesRoutesQuery,
  });

  return (
    <ThemeProvider>
      <NavigatorProvider i18n={props.i18n} data={data || []}>
        <Header pages={props.creatablePages}>
          <SearchBox />
          {props.i18n?.locales.length > 1 ? (
            <LocaleSelect locales={props.i18n.locales} />
          ) : null}
        </Header>
        <List loading={loading} />
      </NavigatorProvider>
    </ThemeProvider>
  );
}

function resolvePreviewFragment(schema: Schema) {
  const documents = schema._original?.types.filter(
    ({ type, name }) =>
      type === "document" &&
      name !== "sanity.imageAsset" &&
      name !== "sanity.fileAsset"
  ) as {
    preview: { select: Record<string, string> };
    fields: {
      type: string;
      name: string;
    }[];
    name: string;
  }[];

  let fragment = "";

  // Loop over the documents
  for (const doc of documents) {
    if (doc.preview) {
      // Loop over the preview.select keys
      for (const [key, value] of Object.entries(doc.preview.select)) {
        let ref = value;
        const field = doc.fields.find((field) => field.name === key);
        const lastDotIndex = value.lastIndexOf(".");
        // Reconstruct a reference
        // !!! WIP: This currently does not work with references !!!
        // Based on Sanity docs (https://www.sanity.io/docs/previews-list-views#56c0e68ed7e6):
        // You can follow references by using dot notation to the related document field you want to display in preview.select.
        // Note that using GROQ joins is not supported here (it’s what the Studio will do under the hood).
        if (field.type === "image" && lastDotIndex !== -1) {
          ref = `${ref.substring(0, lastDotIndex)}->${ref.substring(lastDotIndex + 1)}`;
        }
        fragment += `_type == "${doc.name}" => {
          "${key}": ${ref}
        },`;
      }
    }
  }

  return fragment;
}
