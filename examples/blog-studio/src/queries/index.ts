import {defineQuery} from "groq";

const BLOG_ENTRIES_FILTER_FRAGMENT = `*[_type == "blog.post"
  && (($filterTag != null && defined(tags[]) && $filterTag in tags[]->slug.current)
  || $filterTag == null)]`;

export const BLOG_INDEX_QUERY = defineQuery(`*[_type == "blog.index"][0] {
  "tags": *[_type == "blog.tag"] {
    _id,
    title,
    slug,
  } | order(title asc),
  "entries": ${BLOG_ENTRIES_FILTER_FRAGMENT} | order(publishedAt desc) [$pageStart...$pageEnd] {
    _id,
    pathname,
    publishedAt,
    title,
    authors[] {
      _key,
      ...@-> {
        name,
        avatar,
      },
    },
    tags[] {
      _key,
      ...@-> {
        title,
        slug,
      },
    },
  },
  "entriesCount": count(${BLOG_ENTRIES_FILTER_FRAGMENT}),
  "entriesPerPage": $entriesPerPage,
  "pageNum": $pageNumber,
}`);
