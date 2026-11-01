'use strict';
const config = require('../payroll-assets.json');
function assertPayrollActivation(env = process.env) {
  if (config.activated !== true || env.BABELBET_PAYROLL_ENABLED !== 'true' ||
      env.GITHUB_ACTIONS !== 'true' || env.GITHUB_REPOSITORY !== config.repository ||
      env.GITHUB_ACTOR !== config.stewardGitHub) {
    throw new Error('Payroll inactive: requires reviewed financial configuration, explicit BABELBET_PAYROLL_ENABLED=true, and the named steward in a protected GitHub Actions environment.');
  }
  if (config.chainId !== 8453 || !/^0x[a-fA-F0-9]{40}$/.test(config.routerAddress || '') ||
      /^0x0{40}$/.test(config.routerAddress) || !/^https:\/\//.test(config.rpcUrl || '') ||
      !Object.keys(config.assets || {}).length) {
    throw new Error('Payroll inactive: verified Base router, HTTPS RPC and configured assets required.');
  }
}
module.exports = { assertPayrollActivation };
