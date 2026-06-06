import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

import { GET } from "@/app/api/uploads/atom-previews/[filename]/route";

const previewDir = path.join(process.cwd(), "data", "uploads", "atom-previews");
const testFilename = "library-hair-route-test.png";
const testPath = path.join(previewDir, testFilename);

async function callRoute(filename: string) {
  return GET(new Request(`http://localhost/api/uploads/atom-previews/${filename}`), {
    params: Promise.resolve({ filename }),
  });
}

afterEach(async () => {
  await fs.rm(testPath, { force: true });
});

describe("/api/uploads/atom-previews/[filename]", () => {
  it("serves an existing generated atom preview with immutable cache headers", async () => {
    await fs.mkdir(previewDir, { recursive: true });
    await fs.writeFile(testPath, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const response = await callRoute(testFilename);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    await expect(response.arrayBuffer()).resolves.toHaveProperty("byteLength", 4);
  });

  it("rejects path traversal and unsupported filenames", async () => {
    await expect(callRoute("../bad.png")).resolves.toHaveProperty("status", 400);
    await expect(callRoute("library-hair-route-test.gif")).resolves.toHaveProperty("status", 400);
    await expect(callRoute("library_hair_route_test.png")).resolves.toHaveProperty("status", 400);
  });

  it("returns 404 for a valid preview filename that does not exist", async () => {
    const response = await callRoute("library-hair-missing.png");

    expect(response.status).toBe(404);
  });
});
