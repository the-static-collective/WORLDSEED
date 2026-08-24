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
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
