import React from "react";

import {PagesNavigatorOptions} from "../../../types";
import {NavigatorProvider} from "../context";
import {useSanityFetch} from "../utils";
import Header from "./Header";
import {List} from "./List";
import LocaleSelect from "./LocaleSelect";
import SearchBox from "./SearchBox";
import ThemeProvider from "./ThemeProvider";
import {useCurrentUser} from "sanity";

export function createPagesNavigator(props: PagesNavigatorOptions) {
  return function PagesNavigator() {
    return <DefaultPagesNavigator {...props} />;
  };
}

function DefaultPagesNavigator(props: PagesNavigatorOptions) {
  const currentUser = useCurrentUser();
  const filterBasedOnRoles = props?.filterBasedOnRoles;

  const queryFilter = [`pathname.current != null`];
  // Allow additional filters
  if (filterBasedOnRoles) {
    for (const f of filterBasedOnRoles) {
      if (f.role === "all") {
        queryFilter.push(`${f.filter}`);
      } else if (currentUser?.roles.some((r) => r.name === f.role)) {
        queryFilter.push(`${f.filter}`);
      }
    }
  }

  const pagesRoutesQuery = `
  *[${queryFilter.join(" && ")}]{
    _rev,
    _id,
    _originalId,
    _type,
    _updatedAt,
    _createdAt,
    'pathname': pathname.current,
    locale,
  }
`;

  const [data, loading] = useSanityFetch({
    query: pagesRoutesQuery,
    variables: {},
  });

  return (
    <ThemeProvider>
      <NavigatorProvider
        i18n={props.i18n}
        folders={props.folders}
        data={data || []}
      >
        <Header pages={props.creatablePages}>
          <SearchBox />
          {props.i18n?.locales?.length && props.i18n.locales.length > 1 ? (
            <LocaleSelect locales={props.i18n.locales} />
          ) : null}
        </Header>
        <List loading={loading} />
      </NavigatorProvider>
    </ThemeProvider>
  );
}
