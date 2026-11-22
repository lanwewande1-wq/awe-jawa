import test from 'node:test';
import assert from 'node:assert/strict';

const html = await (await import('node:fs/promises'))
  .readFile(new URL('../index.html', import.meta.url), 'utf8');

test('web app includes both reading modes', () => {
  assert.match(html, /Mode Biasa/);
  assert.match(html, /Mode Prediksi/);
});

test('web app provides copy actions and output sections', () => {
  assert.match(html, /data-copy="jawa"/);
  assert.match(html, /data-copy="latin"/);
  assert.match(html, /data-copy="indo"/);
});
