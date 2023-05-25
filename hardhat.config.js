require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      gasPrice: 225000000000,
      chainId: 1337,
      account: process.env.PRIVATE_KEY_LOCAL,
    },
  },
  fuji: {
    url: "https://api.avax-test.network/ext/bc/C/rpc",
    gasPrice: 225000000000,
    chainId: 43113,
    accounts: [process.env.PRIVATE_KEY_FUJI], // accounts: { mnemonic: MNEMONIC },
  },
  solidity: "0.8.9",
};
