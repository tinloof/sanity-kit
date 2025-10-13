import {sanityFetch} from "./live";
import {PAGE_QUERY} from "./queries";

export async function loadPage(pathname: string) {
  const {data} = await sanityFetch({
    query: PAGE_QUERY,
    params: {pathname},
  });

  return data;
}
