// node --test: checks the client against a fake fetch (no network).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchRows, rowsOf, nextCursor } from '../src/client.js';
import config from '../src/config.js';

const fake = (pages) => {
  const calls = [];
  const f = async (url, opts) => {
    calls.push({ url, opts });
    const body = pages[calls.length - 1];
    return { ok: true, status: 200, headers: new Map(), json: async () => body };
  };
  f.calls = calls;
  return f;
};

test('rowsOf finds the row array', () => {
  assert.deepEqual(rowsOf({ data: [1] }), [1]);
  assert.deepEqual(rowsOf({ props: [2] }), [2]);
  assert.deepEqual(rowsOf({ games: [3] }), [3]);
});

test('nextCursor reads meta and pagination', () => {
  assert.equal(nextCursor({ meta: { next_cursor: 'a' } }), 'a');
  assert.equal(nextCursor({ pagination: { has_more: true, next_cursor: 'b' } }), 'b');
  assert.equal(nextCursor({ pagination: { has_more: false, next_cursor: 'b' } }), null);
});

test('follows cursors up to maxPages and sends the key on keyed endpoints', async () => {
  const keyed = Object.entries(config.endpoints).find(([, e]) => !e.keyless && e.path);
  const ep = keyed[1];
  const f = fake([{ data: [{ a: 1 }], meta: { next_cursor: 'c1' } }, { data: [{ a: 2 }], meta: { next_cursor: 'c2' } }]);
  const rows = [];
  for await (const r of fetchRows({ base: config.base, ep, input: { league: 'nba', limit: 10, maxPages: 2 }, apiKey: 'k', utm: 't', fetchImpl: f })) rows.push(r);
  assert.equal(rows.length, 2);
  assert.equal(f.calls.length, 2);
  assert.match(f.calls[1].url, /cursor=c1/);
  assert.equal(f.calls[0].opts.headers.Authorization, 'Bearer k');
});

test('keyless endpoint never sends a key', async () => {
  const ep = config.endpoints[config.noKey];
  const body = ep.mcpTool
    ? { result: { content: [{ type: 'text', text: JSON.stringify({ data: [{ x: 1 }] }) }] } }
    : { data: [{ x: 1 }] };
  const f = fake([body]);
  const rows = [];
  for await (const r of fetchRows({ base: config.base, ep, input: { league: 'nba' }, apiKey: 'k', utm: 't', fetchImpl: f })) rows.push(r);
  assert.equal(rows.length, 1);
  assert.equal(f.calls[0].opts.headers.Authorization, undefined);
});
