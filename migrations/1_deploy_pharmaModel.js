const PharmaModel = artifacts.require("PharmaModel");

module.exports = async function (deployer) {
  // Deploy PharmaModel without constructor parameters
  await deployer.deploy(PharmaModel);
  // output deployed address
  const instance = await PharmaModel.deployed();
  console.log("PharmaModel deployed at: ", instance.address);
};
