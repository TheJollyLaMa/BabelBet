import { JsonRpcProvider, Network } from 'ethers';

// Provider-side refusals (rate limits, archive-only gating, range caps) are retried on the next URL;
// deterministic JSON-RPC errors such as reverts are returned as-is.
const RETRYABLE_RPC_ERROR = /archive|personal token|limit|rate|too many|exceeded|range|unavailable|timeout|capacity/i;

function isRetryableResult(result) {
  return Boolean(result?.error) && RETRYABLE_RPC_ERROR.test(`${result.error.message || ''} ${result.error.data || ''}`);
}

export function rpcUrlsFromConfig(config = {}) {
  return [...new Set([config.rpcUrl, ...(config.rpcFallbackUrls || [])]
    .map(url => String(url || '').trim()).filter(Boolean))];
}

export class FailoverJsonRpcProvider extends JsonRpcProvider {
  constructor(urls, chainId = 8453) {
    const list = [...new Set((urls || []).map(url => String(url || '').trim()).filter(Boolean))];
    if (!list.length) throw new Error('At least one RPC URL is required');
    const network = Network.from(chainId);
    super(list[0], network, { staticNetwork: network, batchMaxCount: 1 });
    this.rpcUrls = list;
    this.backups = list.slice(1).map(url => new JsonRpcProvider(url, network, { staticNetwork: network, batchMaxCount: 1 }));
  }

  async _send(payload) {
    let lastError = null;
    let lastResults = null;
    for (const send of [p => super._send(p), ...this.backups.map(backup => p => backup._send(p))]) {
      try {
        const results = await send(payload);
        if (!results.some(isRetryableResult)) return results;
        lastResults = results;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastResults) return lastResults;
    throw lastError;
  }

  destroy() {
    for (const backup of this.backups) backup.destroy();
    super.destroy();
  }
}

export function createFailoverProvider(config) {
  return new FailoverJsonRpcProvider(rpcUrlsFromConfig(config), config?.chainId || 8453);
}
