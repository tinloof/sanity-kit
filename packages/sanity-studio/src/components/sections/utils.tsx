import { customAlphabet } from "nanoid";
import { SectionVariantType } from "../../types";

export function filterSectionVariants(
  searchQuery: string,
  sectionVariants: SectionVariantType[]
) {
  const tokens = tokenize(searchQuery);
  const filteredBlockVariants =
    tokens.length > 0
      ? sectionVariants
          .reduce(
            (results, sectionVariant) => {
              const title = tokenize(sectionVariant.title).join(" ");
              const matches = tokens.filter((token) => title.includes(token));

              if (!matches.length) return results;

              const indexToInsert = results.findIndex(
                (result) => result.matchCount < matches.length
              );
              const toAdd = { sectionVariant, matchCount: matches.length };

              if (indexToInsert === -1) return [...results, toAdd];

              return [
                ...results.slice(0, indexToInsert),
                { sectionVariant, matchCount: matches.length },
                ...results.slice(indexToInsert),
              ];
            },
            [] as { sectionVariant: SectionVariantType; matchCount: number }[]
          )
          .map(({ sectionVariant }) => sectionVariant)
      : sectionVariants;
  return filteredBlockVariants;
}

function tokenize(str: string) {
  return str.split(/[\s.-]/g).flatMap((segment) => {
    const acceptedCharacters = [
      "a-z", // lower-case letters
      "0-9", // numbers
    ];

    return (
      segment
        .toString()
        .normalize("NFD") // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
        .toLowerCase()
        .replace(new RegExp(`[^${acceptedCharacters.join("")}]`, "g"), "")
        .replace(/\s+/g, "-")
        .trim() || []
    );
  });
}

export const generateItemKey = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  12
);
