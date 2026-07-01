# PDF Combiner Tool

A single-page tool to bulk-upload images and PDFs, reorder them, then download one merged PDF. Runs entirely in the browser — no backend, no accounts, no persistence. All data lives only in memory for the current tab and is purged on exit.

## User flow

1. Land on `/` — a drop zone plus "Choose files" button, with a short privacy note ("Files stay in your browser and are erased when you close this tab").
2. Bulk-select images (PNG/JPG/WebP) and/or PDFs. Files appear as a vertical list of cards with thumbnail, filename, size, and a remove button.
3. Drag any card up/down to set the final order (also up/down arrow buttons as a fallback for keyboard/mobile).
4. Click **Combine & Download** — progress indicator while merging — browser downloads `combined.pdf`.
5. "Clear all" resets the list and revokes all object URLs immediately.

## Privacy model (no persistence)

- No backend upload — files never leave the device.
- No `localStorage`, `sessionStorage`, IndexedDB, cookies, or service-worker caching of file data.
- State is plain React `useState` in memory only.
- On unmount / `beforeunload` / `pagehide`: revoke every `URL.createObjectURL` blob URL and drop the file array so browser GC releases the underlying bytes.
- After the combined PDF downloads, the generated `Uint8Array` and its blob URL are revoked as soon as the download is triggered.
- If the user navigates away or closes the tab mid-session, nothing remains.

## Scope

- Supported inputs: PDF, PNG, JPG/JPEG, WebP. Unsupported files rejected with a toast.
- Multi-page PDFs included in full, in place.
- Images placed one per page, fit to Letter size with margins, preserving aspect ratio.

## Technical details

- Library: `pdf-lib` for reading source PDFs and generating output. Images embedded via `embedJpg` / `embedPng`; WebP converted to PNG via canvas first.
- Reordering: `@dnd-kit/core` + `@dnd-kit/sortable` for accessible drag-and-drop with keyboard fallback.
- File input: hidden `<input type="file" multiple>` triggered by button, plus native drag-and-drop on the drop zone.
- State shape: `{ id, file, kind, previewUrl }[]` in memory. A `useEffect` cleanup and `pagehide` listener revoke all `previewUrl`s and clear the array.
- Download: `Blob` from `PDFDocument.save()` → anchor click → `URL.revokeObjectURL` immediately after.

## Files

- `src/routes/index.tsx` — replace placeholder with combiner UI; set real `head()` title/description ("PDF Combiner — Merge PDFs and Images privately in your browser").
- `src/components/pdf-combiner/DropZone.tsx` — drop zone + file input trigger.
- `src/components/pdf-combiner/FileList.tsx` — sortable list.
- `src/components/pdf-combiner/FileRow.tsx` — single row (thumbnail, name, size, remove, drag handle).
- `src/lib/combine-pdf.ts` — pure `combineFiles(files: File[]): Promise<Uint8Array>`.
- `src/hooks/use-purge-on-exit.ts` — registers `pagehide`/unmount cleanup that revokes blob URLs and clears state.
- Update `src/routes/__root.tsx` head defaults away from "Lovable App".

## Dependencies to add

- `pdf-lib`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Out of scope

- Page-level reordering within a PDF, page ranges, rotation, password-protected PDFs, OCR, any cloud save.
