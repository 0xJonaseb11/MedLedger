const PharmaModel = artifacts.require("PharmaModel");

module.exports = async function (deployer/*, network, accounts*/) {

    const AXELAR_GATEWAY_ADDRESS = "0xe432150cce91c13a887f7D836923d5597adD8E31";

    // Define the initial supply – for example, 100 tokens with 18 decimals
  const initialSupply = web3.utils.toWei("100000000", "ether"); // Mints 100M tokens

    // Deploy the BurnableToken contract with the required constructor parameters
    await deployer.deploy(
        PharmaModel
        // AXELAR_GATEWAY_ADDRESS,
        // initialSupply
    );
};