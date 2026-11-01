import { validateIPFSHost } from './vendor/decent-head/2.0.0/js/ipfs-host.js';

export function createPreparationIPFSHost({ openLocalBackup }) {
  if (typeof openLocalBackup !== 'function') throw new Error('Local profile backup controls are required.');
  return validateIPFSHost({
    version: 1,
    label: 'BabelBet · private local profile backup / restore',
    capabilities: { backup: { open: openLocalBackup } },
    getStatus: async () => ({
      backup: { state: 'idle', detail: 'Export or restore a validated local profile JSON file. No public upload or IPFS durability claim.' }
    })
  });
}
