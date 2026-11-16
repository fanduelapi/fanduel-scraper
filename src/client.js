// Thin client: calls the API with the user's own key and yields rows.
// No scraping of the betting site itself; all data comes from the documented API.
export const ROW_KEYS = ['data', 'props', 'games', 'moves', 'rows', 'results'];

export function rowsOf(body) {
  if (Array.isArray(body)) return body;
  for (const k of ROW_KEYS) if (Array.isArray(body?.[k])) return body[k];
  return body ? [body] : [];
}

export function nextCursor(body) {
  const m = body?.meta ?? {};
  const p = body?.pagination ?? {};
  if (p.has_more === false) return null;
  return m.next_cursor ?? p.next_cursor ?? null;
}

export function buildParams(ep, input) {
  const params = { ...(input.extraParams ?? {}) };
  if (input.league) params[ep.league ?? 'league'] = ep.upper ? String(input.league).toUpperCase() : input.league;
  if (input.limit) params.limit = input.limit;
  return params;
}

export async function* fetchRows({ base, ep, input, apiKey, utm, fetchImpl = fetch, log = () => {} }) {
  const headers = { Accept: 'application/json', 'User-Agent': `apify-actor/${utm}` };
  if (apiKey && !ep.keyless) headers.Authorization = `Bearer ${apiKey}`;

  if (ep.mcpTool) {
    const res = await fetchImpl(`${base}/api/mcp`, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call',
        params: { name: ep.mcpTool, arguments: { [ep.league ?? 'sport']: input.league } } }),
    });
    const j = await res.json();
    const text = j?.result?.content?.find((c) => c.type === 'text')?.text;
    if (!text) throw new Error(`MCP tool ${ep.mcpTool} failed: ${JSON.stringify(j?.error ?? j).slice(0, 300)}`);
    yield* rowsOf(JSON.parse(text));
    return;
  }

  const params = buildParams(ep, input);
  const maxPages = Math.max(1, input.maxPages ?? 1);
  for (let page = 0; page < maxPages; page++) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
    const url = `${base}${ep.path}${qs.size ? `?${qs}` : ''}`;
    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetchImpl(url, { headers });
      if (res.status === 429 && attempt < 3) {
        const wait = Math.min(Number(res.headers.get('retry-after')) || 2 ** (attempt + 1), 60);
        log(`Rate limited, waiting ${wait}s`);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      break;
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = body?.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`${res.status} ${body?.error?.code ?? ''}: ${msg}`);
    }
    yield* rowsOf(body);
    const cursor = nextCursor(body);
    if (!cursor) return;
    params.cursor = cursor;
  }
}
