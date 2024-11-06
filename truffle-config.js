const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
    networks: {
        sepolia: {
            provider: () => new HDWalletProvider(
                [`0x${process.env.PRIVATE_KEY}`],
                `https://eth-sepolia.g.alchemy.com/v2/6ZlZVfEswLzLCnF55WrOn8Da9gbZKVCO`
            ),
            network_id: 11155111,
            gas: 5500000,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true,
            networkCheckTimeout: 100000
        },
    },
    compilers: {
        solc: {
            version: "0.8.20"
        }
    }
};