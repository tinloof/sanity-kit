export function truncate(str: string, maxLength: number) {
  if (str.length < maxLength) {
    return str;
  }

  // To prevent truncating in the middle of words, let's get
  // the position of the first whitespace after the truncation
  const firstWhitespaceAfterTruncation =
    str.slice(maxLength).search(/\s/) + maxLength;
  return str.slice(0, firstWhitespaceAfterTruncation) + "...";
}
