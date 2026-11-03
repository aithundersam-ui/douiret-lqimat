import QRCode from "qrcode";
import { menuQrUrl } from "@/lib/site/qr";

const burgundy = "#72252A";
const margin = 4;

let logoPromise: Promise<string> | null = null;

/** The shop logo as a PNG data URL, so it stays inside the QR code's SVG and PNG files. */
export function menuQrLogo(): Promise<string> {
  logoPromise ??= new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Trim the empty space around the logo so it fills the middle of the code.
      const src = document.createElement("canvas");
      src.width = img.naturalWidth;
      src.height = img.naturalHeight;
      const sctx = src.getContext("2d")!;
      sctx.drawImage(img, 0, 0);
      const { data, width, height } = sctx.getImageData(0, 0, src.width, src.height);
      let top = height, left = width, bottom = 0, right = 0;
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
          if (data[(y * width + x) * 4 + 3] > 8) {
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
          }
      const w = Math.max(1, right - left + 1);
      const h = Math.max(1, bottom - top + 1);
      const side = 360;
      const scale = side / Math.max(w, h);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      canvas
        .getContext("2d")!
        .drawImage(src, left, top, w, h, (side - w * scale) / 2, (side - h * scale) / 2, w * scale, h * scale);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      logoPromise = null;
      reject(new Error("The logo could not be loaded."));
    };
    img.src = "/brand/logo.webp";
  });
  return logoPromise;
}

/**
 * The menu QR code as an SVG: burgundy squares with the shop logo on a white
 * rounded box in the middle. "H" error correction lets phones read the code
 * even with the middle covered.
 */
export async function menuQrSvg(): Promise<string> {
  const logo = await menuQrLogo();
  const { modules } = QRCode.create(menuQrUrl, { errorCorrectionLevel: "H" });
  const size = modules.size;
  const full = size + margin * 2;

  // The middle box covers about 30% of the code's width, kept centred on the module grid.
  let box = Math.round(size * 0.3);
  if (box % 2 !== size % 2) box += 1;
  const start = (size - box) / 2;
  const covered = (r: number, c: number) => r >= start && r < start + box && c >= start && c < start + box;

  let path = "";
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (modules.get(r, c) && !covered(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;

  const inset = 0.5;
  const x = start + margin + inset;
  const w = box - inset * 2;
  const pad = w * 0.08;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges">` +
    `<rect width="${full}" height="${full}" fill="#fff"/>` +
    `<path fill="${burgundy}" d="${path}"/>` +
    `<rect x="${x}" y="${x}" width="${w}" height="${w}" rx="${w * 0.2}" fill="#fff" shape-rendering="geometricPrecision"/>` +
    `<image x="${x + pad}" y="${x + pad}" width="${w - pad * 2}" height="${w - pad * 2}" xlink:href="${logo}"/>` +
    `</svg>`
  );
}

/** The SVG drawn onto a canvas, for the PNG download. */
export function menuQrPng(svg: string, width = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = width;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, width);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("The QR code could not be drawn."));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
