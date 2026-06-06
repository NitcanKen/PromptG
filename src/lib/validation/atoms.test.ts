import { describe, expect, it } from "vitest";

import { atomUpdateSchema } from "@/lib/validation/atoms";

describe("atomUpdateSchema", () => {
  it("does not inject create defaults into partial updates", () => {
    expect(atomUpdateSchema.parse({ title: "更新標題" })).toEqual({
      title: "更新標題",
    });
  });
});
