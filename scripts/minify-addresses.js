#!/usr/bin/env node

/**
 * Minify address JSON sources and emit copies to public/data and dist/data.
 * Keeps the data out of the JS bundle while making it easy to serve statically.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src', 'data');
const distDir = path.join(root, 'dist', 'data');

const files = ['geography.json', 'districts.json', 'provinces.json', 'subdistricts.json'];

const toKb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

function minifyFile(fileName) {
  const srcPath = path.join(srcDir, fileName);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source file not found: ${srcPath}`);
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const parsed = JSON.parse(raw);
  const minified = JSON.stringify(parsed);

  ensureDir(distDir);

  const distPath = path.join(distDir, fileName);

  fs.writeFileSync(distPath, minified);

  return {
    file: fileName,
    originalBytes: Buffer.byteLength(raw, 'utf8'),
    minifiedBytes: Buffer.byteLength(minified, 'utf8'),
    distPath,
  };
}

function main() {
  let hadError = false;
  files.forEach((file) => {
    try {
      const result = minifyFile(file);
      console.log(
        `[minify] ${result.file} ${toKb(result.originalBytes)} -> ${toKb(result.minifiedBytes)}`
      );
    } catch (err) {
      hadError = true;
      console.error(`[minify] Failed for ${file}:`, err.message);
    }
  });

  if (hadError) {
    process.exitCode = 1;
  }
}

main();

