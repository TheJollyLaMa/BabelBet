const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      from: process.env.OA //dummy account in ganache but should be set to the angel deployer wallet for mainnet deployment
    }//,
    // rinkeby: {
    //   provider: function() { return new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY)},
    //   network_id: 4,
    //   gas: 6500000,
    //   gasPrice: 75000000000
    // }
  },
  plugins: ["truffle-contract-size"],
  contracts_directory: './contracts/',
  contracts_build_directory: './abis/',
  compilers: {
    solc: {
      version: "^0.6.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
