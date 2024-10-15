const PharmaModel = artifacts.require("PharmaModel");

module.exports = async function (deployer) {
  // Deploy PharmaModel without constructor parameters
  await deployer.deploy(PharmaModel);
};
