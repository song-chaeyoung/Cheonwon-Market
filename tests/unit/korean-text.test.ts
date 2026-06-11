import { describe, expect, it } from "vitest";

import { subjectJosa, withSubjectJosa } from "../../src/lib/korean-text";

describe("Korean text utilities", () => {
  it("returns 이가 for a Hangul name with a final consonant", () => {
    expect(subjectJosa("채영")).toBe("이가");
  });

  it("returns 가 for a Hangul word without a final consonant", () => {
    expect(subjectJosa("유나")).toBe("가");
  });

  it("keeps the fallback marker for non-Hangul labels", () => {
    expect(subjectJosa("all")).toBe("이(가)");
  });

  it("appends the subject marker to a label", () => {
    expect(withSubjectJosa("비주")).toBe("비주가");
  });
});
