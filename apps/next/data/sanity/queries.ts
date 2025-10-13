import {defineQuery} from "next-sanity";

export const PAGE_QUERY = defineQuery(`*[pathname.current == $pathname][0]`);
