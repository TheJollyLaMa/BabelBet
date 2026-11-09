export function chainParams(chain) {
  const id = BigInt(chain.chainId);
  if (id <= 0n) throw new Error('chainId must be positive');
  const chainId = `0x${id.toString(16)}`;
  return { switchParams: [{ chainId }], addParams: [{ chainId, chainName: chain.chainName,
    nativeCurrency: chain.nativeCurrency, rpcUrls: chain.rpcUrls, blockExplorerUrls: chain.blockExplorerUrls }] };
}
export function discoverProvider(providers, detail) {
  if (!detail?.provider || typeof detail.provider.request !== 'function' ||
      !detail.info || typeof detail.info.uuid !== 'string' || !detail.info.uuid ||
      typeof detail.info.name !== 'string') return providers;
  if (providers.some(entry => entry.info.uuid === detail.info.uuid || entry.provider === detail.provider)) return providers;
  return [...providers, { info: { ...detail.info }, provider: detail.provider }]
    .sort((a, b) => Number(b.info.rdns === 'io.metamask') - Number(a.info.rdns === 'io.metamask'));
}
export async function switchChain(provider, chain) {
  const { switchParams, addParams } = chainParams(chain);
  if (BigInt(await provider.request({ method: 'eth_chainId' })) === BigInt(chain.chainId)) return;
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: switchParams });
  } catch (error) {
    if (Number(error.code ?? error.data?.originalError?.code) !== 4902) throw error;
    await provider.request({ method: 'wallet_addEthereumChain', params: addParams });
    await provider.request({ method: 'wallet_switchEthereumChain', params: switchParams });
  }
  if (BigInt(await provider.request({ method: 'eth_chainId' })) !== BigInt(chain.chainId)) {
    throw new Error('Wallet did not switch to the configured chain');
  }
}
