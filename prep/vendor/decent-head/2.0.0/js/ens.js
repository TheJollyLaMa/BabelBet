import { config } from './config.js';
import { loadEthers } from './wallet.js';

let mainnet;
export async function lookupWalletName(address) {
  const { JsonRpcProvider, FetchRequest } = await loadEthers();
  if (!mainnet) {
    const request = new FetchRequest(config.ens.rpcUrl);
    request.timeout = 8000;
    mainnet = new JsonRpcProvider(request, 1, { staticNetwork: true });
  }
  const name = await mainnet.lookupAddress(address);
  if (!name) return null;
  const resolved = await mainnet.resolveName(name);
  return resolved?.toLowerCase() === address.toLowerCase() ? name : null;
}
