import { groq } from 'next-sanity'

export const PAGE_QUERY = groq`*[pathname.current == $pathname][0]`
