const GiftCard = artifacts.require("GiftCard");

module.exports = function (deployer) {
  deployer.deploy(GiftCard);
};