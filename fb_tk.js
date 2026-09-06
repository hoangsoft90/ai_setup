#!/usr/bin/env node
/**
 * Decode fb_tk.json from the URL and write the value of a given key
 * to ~/.config/manicode/credentials.json
 *
 * Usage:
 *   node fb_tk.js <key>
 *
 * The file at the URL is a base64-encoded JSON object, e.g.:
 *   { "hoangsoft90": { "default": { ... } }, ... }
 * Running `node fb_tk.js hoangsoft90` writes the JSON string of
 * `json["hoangsoft90"]` into ~/.config/manicode/credentials.json
 */
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const URL = 'https://raw.githubusercontent.com/hoangsoft90/ai_setup/refs/heads/main/fb_tk.json';
const OUT = path.join(os.homedir(), '.config', 'manicode', 'credentials.json');

const key = process.argv[2];
if (!key) {
  console.error('Usage: node fb_tk.js <key>');
  process.exit(1);
}

https.get(URL, (res) => {
  if (res.statusCode !== 200) {
    console.error(`HTTP ${res.statusCode} when fetching ${URL}`);
    process.exit(1);
  }
  let raw = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => (raw += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
      if (!(key in json)) {
        console.error(`Key "${key}" not found. Available keys: ${Object.keys(json).join(', ')}`);
        process.exit(1);
      }
      fs.mkdirSync(path.dirname(OUT), { recursive: true });
      fs.writeFileSync(OUT, JSON.stringify(json[key], null, 2) + '\n');
      console.log(`Written ${OUT}`);
    } catch (err) {
      console.error(`Failed to decode JSON: ${err.message}`);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error(`Request failed: ${err.message}`);
  process.exit(1);
});