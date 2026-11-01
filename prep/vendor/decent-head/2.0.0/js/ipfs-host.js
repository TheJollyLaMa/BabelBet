export const IPFS_CAPABILITIES = Object.freeze({
  backup: 'App backups',
  replication: 'Public community pins',
  rewards: 'Pinning reward participation',
});

const STATES = ['unavailable', 'idle', 'pending', 'ready', 'error'];
const text = value => typeof value === 'string' && value.trim().length > 0;

export function validateIPFSHost(adapter) {
  if (!adapter || adapter.version !== 1 || !text(adapter.label) ||
      typeof adapter.getStatus !== 'function' || !adapter.capabilities ||
      typeof adapter.capabilities !== 'object' || Array.isArray(adapter.capabilities)) {
    throw new Error('Configure a version 1 IPFS host adapter with a label, getStatus and capabilities.');
  }
  for (const [key, capability] of Object.entries(adapter.capabilities)) {
    if (!Object.hasOwn(IPFS_CAPABILITIES, key) || !capability || typeof capability.open !== 'function') {
      throw new Error(`Invalid IPFS host capability: ${key}`);
    }
  }
  return adapter;
}

export async function readIPFSHostStatus(adapter) {
  validateIPFSHost(adapter);
  const status = await adapter.getStatus();
  if (!status || typeof status !== 'object' || Array.isArray(status)) {
    throw new Error('IPFS host status must be an object.');
  }
  const result = {};
  for (const key of Object.keys(IPFS_CAPABILITIES)) {
    if (!Object.hasOwn(adapter.capabilities, key)) {
      result[key] = { state: 'unavailable', detail: 'Not configured by this app.' };
      continue;
    }
    const entry = status[key];
    if (!entry || !STATES.includes(entry.state) || !text(entry.detail)) {
      throw new Error(`IPFS host must report an explicit state and detail for ${key}.`);
    }
    result[key] = { state: entry.state, detail: entry.detail };
  }
  return result;
}

export async function openIPFSHostControls(adapter, capability) {
  validateIPFSHost(adapter);
  if (!Object.hasOwn(IPFS_CAPABILITIES, capability) || !Object.hasOwn(adapter.capabilities, capability)) {
    throw new Error(`IPFS controls are not configured for ${capability}.`);
  }
  await adapter.capabilities[capability].open();
}
