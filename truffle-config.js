const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
    networks: {
        sepolia: {
            provider: () => new HDWalletProvider(
                [`0x${process.env.PRIVATE_KEY}`],
                `${process.env.INFURA_RPC_URL}`
            ),
            network_id: 11155111,
            gas: 550000,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
    },
    compilers: {
        solc: {
            version: "0.8.20"
        }
    }
};