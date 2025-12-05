#!/usr/bin/env node

/**
 * Lightweight Express server to serve minified address assets with compression.
 * Usage: npm run serve:data
 */
const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

app.use(compression());
app.use('/data', express.static(dataDir, { immutable: true, maxAge: '1d' }));

app.listen(port, () => {
  console.log(`Serving /data from ${dataDir} with compression on port ${port}`);
});

