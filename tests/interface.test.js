import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const REQUIRED_COPY = [
  'What entered the world?',
  'Capture',
  'Link',
  'Source',
  'Contradict',
  'Wander',
  'Export World',
  'stays in this browser unless you export it',
];

test('writer-facing shell exposes the v0.1 verbs and local-only privacy promise', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  for (const phrase of REQUIRED_COPY) {
    assert.match(html, new RegExp(escapeRegExp(phrase), 'i'), `missing interface copy: ${phrase}`);
  }

  assert.match(html, /src\/app\.js/);
  assert.match(html, /styles\.css/);
});

test('browser shell persists locally, uses the world domain API, and makes no network fetches', async () => {
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

  for (const symbol of [
    'captureNode',
    'addRelation',
    'addSource',
    'addContradiction',
    'getNeighborhood',
    'parseWorld',
    'serializeWorld',
    'localStorage',
  ]) {
    assert.match(app, new RegExp(escapeRegExp(symbol)), `missing app wiring: ${symbol}`);
  }

  assert.doesNotMatch(app, /\bfetch\s*\(/, 'WORLDSEED v0.1 must not make network fetches');
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
