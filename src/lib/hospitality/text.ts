/** Capitalize the first letter of each sentence while typing. */
export function capitalizeSentences(raw: string): string {
  if (!raw) return raw;

  let result = "";
  let capitalizeNext = true;

  for (const character of raw) {
    if (capitalizeNext && /[A-Za-z]/.test(character)) {
      result += character.toUpperCase();
      capitalizeNext = false;
      continue;
    }

    result += character;

    if (/[.!?]/.test(character)) {
      capitalizeNext = true;
    }
  }

  return result;
}
