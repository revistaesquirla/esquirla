// Copia el worker de pdf.js a /public para que el lector funcione sin CDN.
// Se ejecuta solo con "npm install" (script postinstall).
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const source = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destinationDir = path.join(process.cwd(), 'public');
const destination = path.join(destinationDir, 'pdf.worker.min.mjs');

try {
  if (!existsSync(source)) {
    console.warn('[esquirla] No se encontró pdf.worker.min.mjs. ¿Se instaló pdfjs-dist?');
    process.exit(0);
  }
  await mkdir(destinationDir, { recursive: true });
  await copyFile(source, destination);
  console.log('[esquirla] Worker de PDF copiado a public/pdf.worker.min.mjs');
} catch (error) {
  console.warn('[esquirla] No se pudo copiar el worker de PDF:', error);
}
