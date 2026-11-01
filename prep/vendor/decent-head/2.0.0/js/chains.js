const icon = name => new URL(`../img/chains/${name}.svg`, import.meta.url).href;
export const CHAIN_ICONS = Object.freeze({ 1: icon('ethereum'), 10: icon('optimism'), 8453: icon('base') });
