import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const MANIFEST_PATH = join(DIST, 'manifest.json');

/**
 * Collect JS paths listed under web_accessible_resources.
 * @param {Record<string, unknown>} manifest
 * @returns {Set<string>}
 */
function collectWarJs(manifest) {
  /** @type {Set<string>} */
  const war = new Set();
  const entries = manifest.web_accessible_resources;
  if (!Array.isArray(entries)) {
    return war;
  }

  for (const entry of entries) {
    const resources = entry?.resources;
    if (!Array.isArray(resources)) {
      continue;
    }
    for (const resource of resources) {
      if (typeof resource === 'string' && resource.endsWith('.js')) {
        war.add(normalizeDistPath(resource));
      }
    }
  }
  return war;
}

/**
 * @param {string} path
 * @returns {string}
 */
function normalizeDistPath(path) {
  return path.replace(/^\.\//, '').replace(/\\/g, '/');
}

/**
 * Resolve service worker entry from manifest (MV3).
 * @param {Record<string, unknown>} manifest
 * @returns {string | null}
 */
function getServiceWorkerEntry(manifest) {
  const bg = manifest.background;
  if (!bg || typeof bg !== 'object') {
    return null;
  }
  const serviceWorker = /** @type {{ service_worker?: string }} */ (bg).service_worker;
  if (typeof serviceWorker !== 'string') {
    return null;
  }
  return normalizeDistPath(serviceWorker);
}

/**
 * Recursively collect relative import paths from a JS file under dist/.
 * Handles static `from"…"` / `from'…'` and `import("…")` / `import('…')`.
 * @param {string} entryRel
 * @returns {Set<string>}
 */
function collectSwImports(entryRel) {
  /** @type {Set<string>} */
  const visited = new Set();
  /** @type {string[]} */
  const queue = [entryRel];

  // Static imports: import './x.js'; import{a}from'./x.js'; import('./x.js')
  const importRe =
    /(?:import\s*\(\s*|from\s*|import\s+)["'](\.?\.?\/[^"']+\.js)["']/g;

  while (queue.length > 0) {
    const rel = queue.pop();
    if (!rel || visited.has(rel)) {
      continue;
    }
    visited.add(rel);

    const abs = join(DIST, rel);
    if (!existsSync(abs)) {
      console.warn(`[verify-extension-build] Missing SW file: ${rel}`);
      continue;
    }

    const source = readFileSync(abs, 'utf8');
    const baseDir = dirname(rel);

    for (const match of source.matchAll(importRe)) {
      const spec = match[1];
      if (!spec) {
        continue;
      }
      const resolved = normalizeDistPath(join(baseDir, spec));
      if (!visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  return visited;
}

function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error('[verify-extension-build] FAIL: dist/manifest.json not found. Run vite build first.');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const warJs = collectWarJs(manifest);
  const swEntry = getServiceWorkerEntry(manifest);

  if (!swEntry) {
    console.error('[verify-extension-build] FAIL: no background.service_worker in manifest.');
    process.exit(1);
  }

  const swImports = collectSwImports(swEntry);
  /** @type {string[]} */
  const overlap = [...swImports].filter((file) => warJs.has(file)).sort();

  console.log('[verify-extension-build] Service worker entry:', swEntry);
  console.log('[verify-extension-build] SW import graph size:', swImports.size);
  console.log('[verify-extension-build] WAR JS resources:', warJs.size);
  console.log('[verify-extension-build] Overlap (SW ∩ WAR):', overlap.length);

  if (overlap.length > 0) {
    console.error('[verify-extension-build] FAIL: service worker imports web-accessible resources:');
    for (const file of overlap) {
      console.error(`  - ${file}`);
    }
    console.error(
      'Content scripts must not share runtime chunks with the service worker. See src/content/chromeApi.ts.',
    );
    process.exit(1);
  }

  console.log('[verify-extension-build] PASS: no SW / web_accessible_resources JS overlap.');
}

main();
