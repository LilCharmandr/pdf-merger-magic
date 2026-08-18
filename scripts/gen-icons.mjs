import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function drawIcon(size, { padded = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const bg = hexToRgb("#4f7cff");
  const bgDark = hexToRgb("#3a63e0");
  const white = [255, 255, 255];
  const pink = hexToRgb("#f9a8c9");
  const cornerR = size * 0.22;

  const margin = padded ? size * 0.1 : 0;
  const headCx = size / 2;
  const headCy = size * (0.56 + margin / size);
  const headR = size * (padded ? 0.26 : 0.3);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // rounded-rect background via distance field
      const dx = Math.max(0, Math.max(cornerR - x, x - (size - cornerR), 0));
      const dy = Math.max(0, Math.max(cornerR - y, y - (size - cornerR), 0));
      let inside = true;
      if (x < cornerR && y < cornerR) inside = Math.hypot(cornerR - x, cornerR - y) <= cornerR;
      else if (x > size - cornerR && y < cornerR)
        inside = Math.hypot(x - (size - cornerR), cornerR - y) <= cornerR;
      else if (x < cornerR && y > size - cornerR)
        inside = Math.hypot(cornerR - x, y - (size - cornerR)) <= cornerR;
      else if (x > size - cornerR && y > size - cornerR)
        inside = Math.hypot(x - (size - cornerR), y - (size - cornerR)) <= cornerR;

      let color = mixColor(bg, bgDark, y / size);
      let alpha = 255;
      if (!inside) alpha = 0;

      // ears (triangles) — poke up and outward from the head silhouette
      const leftEar = pointInTriangle(
        x,
        y,
        headCx - headR * 0.78,
        headCy - headR * 0.5,
        headCx - headR * 0.12,
        headCy - headR * 0.95,
        headCx - headR * 1.0,
        headCy - headR * 1.2,
      );
      const rightEar = pointInTriangle(
        x,
        y,
        headCx + headR * 0.78,
        headCy - headR * 0.5,
        headCx + headR * 0.12,
        headCy - headR * 0.95,
        headCx + headR * 1.0,
        headCy - headR * 1.2,
      );
      if (leftEar || rightEar) color = white;

      // head circle
      const distHead = Math.hypot(x - headCx, y - headCy);
      if (distHead <= headR) color = white;

      // eyes
      const eyeDx = headR * 0.42;
      const eyeDy = headR * 0.05;
      const eyeR = Math.max(1, headR * 0.09);
      if (Math.hypot(x - (headCx - eyeDx), y - (headCy + eyeDy)) <= eyeR) color = bgDark;
      if (Math.hypot(x - (headCx + eyeDx), y - (headCy + eyeDy)) <= eyeR) color = bgDark;

      // nose
      const nose = pointInTriangle(
        x,
        y,
        headCx - headR * 0.09,
        headCy + headR * 0.28,
        headCx + headR * 0.09,
        headCy + headR * 0.28,
        headCx,
        headCy + headR * 0.42,
      );
      if (nose) color = pink;

      buf[idx] = Math.round(color[0]);
      buf[idx + 1] = Math.round(color[1]);
      buf[idx + 2] = Math.round(color[2]);
      buf[idx + 3] = alpha;
    }
  }
  return buf;
}

function writeIcon(size, filename, opts) {
  const buf = drawIcon(size, opts);
  const png = encodePNG(size, size, buf);
  const outPath = path.join(outDir, filename);
  writeFileSync(outPath, png);
  console.log("wrote", outPath, `${(png.length / 1024).toFixed(1)}kb`);
}

writeIcon(192, "icon-192.png");
writeIcon(512, "icon-512.png");
writeIcon(180, "apple-touch-icon.png", { padded: true });
