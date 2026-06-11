export function subjectJosa(value: string) {
  const lastCharacter = value.at(-1);

  if (!lastCharacter) {
    return "이(가)";
  }

  const code = lastCharacter.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) {
    return "이(가)";
  }

  return (code - 0xac00) % 28 > 0 ? "이가" : "가";
}

export function withSubjectJosa(value: string) {
  return `${value}${subjectJosa(value)}`;
}
