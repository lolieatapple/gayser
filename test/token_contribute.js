const { contract, web3 } = require('@openzeppelin/test-environment');
const { expectRevert, expectEvent, BN, constants } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const _require = require('app-root-path').require;
const BlockchainCaller = _require('/util/blockchain_caller');
const chain = new BlockchainCaller(web3);
const {
  $AMPL,
  invokeRebase
} = _require('/test/helper');

const AmpleforthErc20 = contract.fromArtifact('UFragments');
const TokenGeyser = contract.fromArtifact('TokenGeyser');
const InitialSharesPerToken = 10 ** 6;

let ampl, dist, owner, anotherAccount;
describe('contributeTokens', function () {
  beforeEach('setup contracts', async function () {
    const accounts = await chain.getUserAccounts();
    owner = web3.utils.toChecksumAddress(accounts[0]);
    anotherAccount = web3.utils.toChecksumAddress(accounts[8]);

    ampl = await AmpleforthErc20.new();
    await ampl.initialize(owner);
    await ampl.setMonetaryPolicy(owner);

    const startBonus = 0;
    const bonusPeriod = 60 * 60 * 24 * 30;
    dist = await TokenGeyser.new(ampl.address, ampl.address, 10, startBonus, bonusPeriod,
      InitialSharesPerToken);
  });
  describe('contributeTokens', function () {
    beforeEach(async function () {
      expect(await dist.totalStaked.call()).to.be.bignumber.equal($AMPL(0));
      await ampl.approve(dist.address, $AMPL(100));
    });
    it('should deduct ampls for the staker', async function () {
      const b = await ampl.balanceOf.call(owner);
      await dist.contributeTokens($AMPL(100));
      const b_ = await ampl.balanceOf.call(owner);
      expect(b.sub(b_)).to.be.bignumber.equal($AMPL(100));
    });
    it('should updated the total contribution', async function () {
      await dist.contributeTokens($AMPL(10));
      expect(await dist.totalContribution.call()).to.be.bignumber.equal($AMPL(10));
      await dist.contributeTokens($AMPL(10));
      expect(await dist.totalContribution.call()).to.be.bignumber.equal($AMPL(20));
    });
    it('should log Contributed', async function () {
      const r = await dist.contributeTokens($AMPL(20));
      expectEvent(r, 'Contributed', {
        amount: $AMPL(20),
        total: $AMPL(20)
      });
      expect(await dist.distributionBalance.call()).to.be.bignumber.equal($AMPL(20));
      const r2 = await dist.contributeTokens($AMPL(30));
      expect(await dist.totalContribution.call()).to.be.bignumber.equal($AMPL(50));
      expectEvent(r2, 'Contributed', {
        amount: $AMPL(30),
        total: $AMPL(50)
      });
      expect(await dist.distributionBalance.call()).to.be.bignumber.equal($AMPL(50));
    });
  });
});
