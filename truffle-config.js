const HDWalletProvider = require('@truffle/hdwallet-provider');

// Your private key (keep this secret and never commit it to version control!)
const PRIVATE_KEY = [process.env.PRIVATE_KEY];

module.exports = {
networks: {
    warden: {
    provider: function() {
        return new HDWalletProvider(PRIVATE_KEY, "http://localhost:8545");
    },
    network_id: "*", 
    host: "127.0.0.1",
    port: 8545,
    gas: 5500000,
    gasPrice: 20000000000,  // 20 gwei
    },
},
compilers: {
    solc: {
    version: "0.8.20",
    }
}
};