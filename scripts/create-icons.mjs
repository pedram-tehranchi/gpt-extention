import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');

// Minimal valid 1×1 PNG (Chrome scales as needed for dev).
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

const sizes = [16, 48, 128];

await mkdir(iconsDir, { recursive: true });

for (const size of sizes) {
  await writeFile(join(iconsDir, `icon-${size}.png`), MINIMAL_PNG);
}

console.log(`Created placeholder icons in ${iconsDir}`);
