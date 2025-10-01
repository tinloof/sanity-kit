export const TRANSLATIONS_FRAGMENT = /* groq */ `
  "translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "pathname": pathname.current,
    locale
  }
`;
