import { Actor, log } from 'apify';
import { fetchRows } from './client.js';
import config from './config.js';

await Actor.init();
const input = (await Actor.getInput()) ?? {};
const apiKey = (input.apiKey || process.env[config.env] || '').trim();

let endpoint = input.endpoint || config.defaultEndpoint;
let ep = config.endpoints[endpoint];
if (!ep) throw new Error(`Unknown endpoint "${endpoint}". Options: ${Object.keys(config.endpoints).join(', ')}`);
if (!apiKey && !ep.keyless) {
  log.warning(`No API key, so "${endpoint}" cannot run. ${config.noKeyNote}`);
  log.warning(`Free key (${config.free}): ${config.signupUrl}`);
  endpoint = config.noKey;
  ep = config.endpoints[endpoint];
}
if (input.league === undefined) input.league = config.leagueDefault;

log.info(`Reading ${endpoint} from ${config.base}`);
let count = 0;
const batch = [];
for await (const row of fetchRows({ base: config.base, ep, input, apiKey, utm: config.name, log: log.info.bind(log) })) {
  batch.push({ ...row, _endpoint: endpoint, _source: config.base });
  count++;
  if (batch.length >= 500) await Actor.pushData(batch.splice(0));
  if (input.maxItems && count >= input.maxItems) break;
}
if (batch.length) await Actor.pushData(batch);
log.info(`Saved ${count} rows to the dataset.`);
if (!apiKey) log.info(`Want full, live data? Free key (${config.free}): ${config.signupUrl}`);
await Actor.exit();
