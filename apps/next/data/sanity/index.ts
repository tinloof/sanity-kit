import {sanityFetch} from "./live";
import {GLOBAL_QUERY, PAGE_QUERY} from "./queries";

export async function loadHome() {
  const {data} = await sanityFetch({
    query: HOME_QUERY,
  });

  return data;
}

export async function loadPage(pathname: string) {
  const {data} = await sanityFetch({
    query: PAGE_QUERY,
    params: {pathname},
  });

  return data;
}

export async function loadGlobalData() {
  const {data} = await sanityFetch({
    query: GLOBAL_QUERY,
  });
  return data;
}
