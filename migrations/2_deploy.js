const TokenGeyser = artifacts.require('TokenGeyser.sol');
const FNXCoin = artifacts.require('FNXCoin.sol');
const UNICoin = artifacts.require('UNICoin.sol');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(FNXCoin);
    await deployer.deploy(UNICoin);
    await deployer.deploy(TokenGeyser, UNICoin.address, FNXCoin.address,
        0, 3600, 20000);
    console.log('UNI', UNICoin.address);
    console.log('FNX', FNXCoin.address);
    console.log('Geyser', TokenGeyser.address);
}

