// Copies the Ghostscript WebAssembly build into public/, where the Posters screen loads it
// in the browser to turn a saved poster PDF into a CMYK PDF for print shops.
import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const pkg = join(process.cwd(), "node_modules", "@okathira", "ghostpdl-wasm");
const out = join(process.cwd(), "public", "vendor", "ghostscript");
mkdirSync(out, { recursive: true });
for (const [from, to] of [["dist/gs.js", "gs.js"], ["dist/gs.wasm", "gs.wasm"], ["LICENSE", "LICENSE.txt"]]) cpSync(join(pkg, from), join(out, to));
console.log("Ghostscript copied to public/vendor/ghostscript");
