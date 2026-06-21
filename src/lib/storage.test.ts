import assert from "node:assert/strict";
import test from "node:test";

test("uses the configured storage bucket", async () => {
  process.env.SUPABASE_STORAGE_BUCKET = "configured-bucket";

  const { BUCKET } = await import("./storage");

  assert.equal(BUCKET, "configured-bucket");
});
