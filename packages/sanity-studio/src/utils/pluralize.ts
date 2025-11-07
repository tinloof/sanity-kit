export function pluralize(word: string): string {
  if (!word) return word;

  const lowercased = word.toLowerCase();

  // Words ending in s, ss, sh, ch, x, z
  if (
    /[sxz]$/.test(lowercased) ||
    /[sh]$/.test(lowercased) ||
    /ch$/.test(lowercased)
  ) {
    return `${word}es`;
  }

  // Words ending in consonant + y
  if (/[^aeiou]y$/.test(lowercased)) {
    return `${word.slice(0, -1)}ies`;
  }

  // Words ending in f or fe
  if (/f$/.test(lowercased)) {
    return `${word.slice(0, -1)}ves`;
  }
  if (/fe$/.test(lowercased)) {
    return `${word.slice(0, -2)}ves`;
  }

  // Words ending in consonant + o
  if (/[^aeiou]o$/.test(lowercased)) {
    return `${word}es`;
  }

  // Default: add s
  return `${word}s`;
}
