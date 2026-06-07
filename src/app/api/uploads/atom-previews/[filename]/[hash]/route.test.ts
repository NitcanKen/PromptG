import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

import { GET } from "@/app/api/uploads/atom-previews/[filename]/[hash]/route";

const previewDir = path.join(process.cwd(), "data", "uploads", "atom-previews");
const atomId = "library-hair-route-test";
const hash = "0123456789abcdef.png";
const testPath = path.join(previewDir, atomId, hash);

async function callRoute(testAtomId: string, testHash: string) {
  return GET(new Request(`http://localhost/api/uploads/atom-previews/${testAtomId}/${testHash}`), {
    params: Promise.resolve({ filename: testAtomId, hash: testHash }),
  });
}

afterEach(async () => {
  await fs.rm(path.join(previewDir, atomId), { recursive: true, force: true });
});

describe("/api/uploads/atom-previews/[filename]/[hash]", () => {
  it("serves a hash-addressed generated atom preview without sticky immutable cache headers", async () => {
    await fs.mkdir(path.dirname(testPath), { recursive: true });
    await fs.writeFile(testPath, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const response = await callRoute(atomId, hash);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.arrayBuffer()).resolves.toHaveProperty("byteLength", 4);
  });

  it("rejects path traversal, unsupported atom IDs, and non-hash filenames", async () => {
    await expect(callRoute("../bad", hash)).resolves.toHaveProperty("status", 400);
    await expect(callRoute(atomId, "../bad.png")).resolves.toHaveProperty("status", 400);
    await expect(callRoute(atomId, "not-a-hash.png")).resolves.toHaveProperty("status", 400);
    await expect(callRoute(atomId, "0123456789abcdef.gif")).resolves.toHaveProperty("status", 400);
  });

  it("returns 404 for a valid hash-addressed preview path that does not exist", async () => {
    const response = await callRoute(atomId, hash);

    expect(response.status).toBe(404);
  });
});
