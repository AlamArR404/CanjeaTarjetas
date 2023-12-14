require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    ganache: {
      provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC, "http://127.0.0.1:7545");
      },
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.8.18",
    },
  },
};
