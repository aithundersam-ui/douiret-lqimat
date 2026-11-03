// Turns a poster PDF saved from the browser (which is always RGB) into a CMYK PDF for a
// print shop. Ghostscript runs as WebAssembly in the browser, so the file never leaves
// this computer. scripts/copy-ghostscript.mjs puts it in public/vendor/ghostscript/.

type GhostscriptModule = {
  callMain(args: string[]): number;
  FS: { writeFile(path: string, data: Uint8Array): void; readFile(path: string): Uint8Array };
};
type ModuleFactory = (options: Record<string, unknown>) => Promise<GhostscriptModule>;

const base = "/vendor/ghostscript/";
let ready: Promise<{ factory: ModuleFactory; wasm: ArrayBuffer }> | null = null;

/** Downloads the converter once (about 15 MB); later conversions reuse it. */
export function loadCmykConverter() {
  ready ??= Promise.all([
    import(/* webpackIgnore: true */ `${base}gs.js`).then((m) => m.default as ModuleFactory),
    fetch(`${base}gs.wasm`).then((r) => {
      if (!r.ok) throw new Error("The PDF converter could not be downloaded.");
      return r.arrayBuffer();
    }),
  ]).then(
    ([factory, wasm]) => ({ factory, wasm }),
    (err) => {
      ready = null;
      throw err;
    },
  );
  return ready;
}

/** The same PDF with every colour converted to CMYK, ready for professional printing. */
export async function toCmykPdf(pdf: ArrayBuffer): Promise<Uint8Array> {
  const { factory, wasm } = await loadCmykConverter();
  const log: string[] = [];
  // A fresh Ghostscript for every file: it is built to run once and exit.
  const gs = await factory({
    wasmBinary: wasm,
    print: (line: string) => log.push(line),
    printErr: (line: string) => log.push(line),
  });
  gs.FS.writeFile("/in.pdf", new Uint8Array(pdf));
  const code = gs.callMain([
    "-dSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-dQUIET",
    "-sDEVICE=pdfwrite",
    "-dPDFSETTINGS=/prepress",
    "-sColorConversionStrategy=CMYK",
    "-sProcessColorModel=DeviceCMYK",
    "-dAutoRotatePages=/None",
    "-sOutputFile=/out.pdf",
    "/in.pdf",
  ]);
  if (code !== 0) throw new Error(log.filter(Boolean).slice(-3).join(" ") || "The PDF could not be converted.");
  return gs.FS.readFile("/out.pdf");
}
