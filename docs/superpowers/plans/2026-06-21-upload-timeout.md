# Upload Timeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghentikan request upload setelah 60 detik dan menampilkan pesan timeout yang jelas.

**Architecture:** Gunakan `AbortSignal.timeout()` langsung pada `fetch` yang sudah ada. Ekspor konstanta timeout dan formatter error kecil dari komponen agar perilaku timeout dapat diuji tanpa menambah dependency.

**Tech Stack:** React 19, TypeScript, Node test runner.

---

### Task 1: Upload timeout

**Files:**
- Modify: `src/components/admin/ImageUploader.tsx`
- Create: `src/components/admin/ImageUploader.test.ts`

- [ ] **Step 1: Write the failing test**

Uji bahwa timeout adalah 60 detik dan `TimeoutError` menghasilkan pesan khusus.

- [ ] **Step 2: Verify RED**

Run: `node --import tsx src/components/admin/ImageUploader.test.ts`
Expected: FAIL karena export timeout belum tersedia.

- [ ] **Step 3: Implement minimal behavior**

Tambahkan `UPLOAD_TIMEOUT_MS = 60_000`, `signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS)`, dan pemetaan `TimeoutError` pada blok `catch`.

- [ ] **Step 4: Verify GREEN**

Run: `node --import tsx src/components/admin/ImageUploader.test.ts`
Expected: 1 test PASS.

- [ ] **Step 5: Verify project**

Run: `npm run lint && npx tsc --noEmit && git diff --check`
Expected: exit code 0.
