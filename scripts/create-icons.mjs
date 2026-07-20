import { access, copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');
const masterPath = join(iconsDir, 'icon-master.png');
const sizes = [16, 48, 128];

await mkdir(iconsDir, { recursive: true });

try {
  await access(masterPath);
} catch {
  console.error(
    'Missing public/icons/icon-master.png — add a 128×128 brand PNG before running npm run icons.',
  );
  process.exit(1);
}

for (const size of sizes) {
  const out = join(iconsDir, `icon-${size}.png`);
  if (size === 128) {
    await copyFile(masterPath, out);
    continue;
  }

  const result = spawnSync(
    'sips',
    ['-z', String(size), String(size), masterPath, '--out', out],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    console.error(result.stderr || `Failed to resize icon to ${size}px`);
    process.exit(1);
  }
}

console.log(`Created brand icons (16/48/128) in ${iconsDir}`);
