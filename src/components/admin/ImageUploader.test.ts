import assert from "node:assert/strict";
import test from "node:test";

import {
  getUploadErrorMessage,
  UPLOAD_TIMEOUT_MS,
} from "./ImageUploader";

test("reports an upload timeout after 60 seconds", () => {
  assert.equal(UPLOAD_TIMEOUT_MS, 60_000);
  assert.equal(
    getUploadErrorMessage(new DOMException("Timed out", "TimeoutError")),
    "Upload melewati batas waktu 60 detik. Silakan coba lagi.",
  );
});
