import { PDFDocument } from "pdf-lib";

export type SupportedKind = "pdf" | "image";

export function detectKind(file: File): SupportedKind | null {
  const type = file.type.toLowerCase();
  if (type === "application/pdf") return "pdf";
  if (type === "image/png" || type === "image/jpeg" || type === "image/jpg" || type === "image/webp") {
    return "image";
  }
  return null;
}

// US Letter, in points
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 36;

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

async function webpToPng(file: File): Promise<Uint8Array> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("Failed to convert WebP");
  return new Uint8Array(await blob.arrayBuffer());
}

export async function combineFiles(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();

  for (const file of files) {
    const kind = detectKind(file);
    if (kind === "pdf") {
      const bytes = await fileToArrayBuffer(file);
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
    } else if (kind === "image") {
      let img;
      const type = file.type.toLowerCase();
      if (type === "image/png") {
        img = await out.embedPng(await fileToArrayBuffer(file));
      } else if (type === "image/webp") {
        img = await out.embedPng(await webpToPng(file));
      } else {
        img = await out.embedJpg(await fileToArrayBuffer(file));
      }
      const page = out.addPage([PAGE_W, PAGE_H]);
      const availW = PAGE_W - MARGIN * 2;
      const availH = PAGE_H - MARGIN * 2;
      const scale = Math.min(availW / img.width, availH / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, {
        x: (PAGE_W - w) / 2,
        y: (PAGE_H - h) / 2,
        width: w,
        height: h,
      });
    }
  }

  return await out.save();
}
