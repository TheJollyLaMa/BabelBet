export const defaults = {
  version: '2.0.0', appName: 'DecentHead', subtitle: 'Your dapp. Your data. Your wallet.',
  enableIPFS: true, theme: {}, art: { ipfsIcon: null, titleIcon: null, walletIcon: null, titleEnds: ['::-', '-::'] },
  ens: { enabled: true, rpcUrl: 'https://ethereum-rpc.publicnode.com' },
  chain: { chainId: 8453, chainName: 'Base', rpcUrls: ['https://mainnet.base.org'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://basescan.org'] },
  providers: { default: 'pinata', pinata: { uploadUrl: 'https://api.pinata.cloud/pinning/pinFileToIPFS' },
    local: { apiUrl: 'http://127.0.0.1:5001' }, gateway: 'https://ipfs.io/ipfs/', ucanAuth: null },
  about: { title: 'About DecentHead', summary: 'The customizable web3 head for Decent dapps.', sections: [] },
  links: [], relatedDapps: [], supporterDnft: null,
};
const plain = value => value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
export function mergeConfig(base, override = {}) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key) || value === undefined) continue;
    result[key] = plain(value) && plain(base[key]) ? mergeConfig(base[key], value) : value;
  }
  return result;
}
export const config = mergeConfig(defaults, globalThis.DECENT_CONFIG);
