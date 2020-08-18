const connectionConfig = require('frg-ethereum-runners/config/network_config.json');
const PrivateKeyProvider = require('truffle-privatekey-provider');
const HDWalletProvider = require('truffle-hdwallet-provider');

const mainnetUrl = 'https://mainnet.infura.io/v3/2521699167dc43c8b4c15f07860c208a';

function keystoreProvider (providerURL) {
  const fs = require('fs');
  const EthereumjsWallet = require('ethereumjs-wallet');
  const HDWalletProvider = require('truffle-hdwallet-provider');

  const KEYFILE = process.env.KEYFILE;
  const PASSPHRASE = (process.env.PASSPHRASE || '');
  if (!KEYFILE) {
    throw new Error('Expected environment variable KEYFILE with path to ethereum wallet keyfile');
  }

  const KEYSTORE = JSON.parse(fs.readFileSync(KEYFILE));
  const wallet = EthereumjsWallet.fromV3(KEYSTORE, PASSPHRASE);
  return new HDWalletProvider(wallet._privKey.toString('hex'), providerURL);
}

module.exports = {
  networks: {
    ganacheUnitTest: connectionConfig.ganacheUnitTest,
    gethUnitTest: connectionConfig.gethUnitTest,
    testrpcCoverage: connectionConfig.testrpcCoverage,
    mainnet: {
      ref: 'mainnet-prod',
      network_id: 1,
      provider: () => keystoreProvider(mainnetUrl),
      gasPrice: 30000000000
    },
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
      gasPrice: 1e9,
      gasLimit: 1e7,
      from: '0x3EbF0B2543E5430474917d20acF92F7C15196DD0'
    },
    rinkeby: {
      provider: () => new PrivateKeyProvider('', 'https://rinkeby.infura.io/v3/f977681c79004fad87aa00da8f003597'),
      network_id: 4,
      gasPrice: 10e9,
      gasLimit: 4700000,
      skipDryRun: true
    }
  },
  mocha: {
    enableTimeouts: false,
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD'
    }
  },
  compilers: {
    solc: {
      version: '0.5.0'
    }
  }
};
