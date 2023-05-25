const hre = require("hardhat");

async function main() {
  // Retrieve the contract factory
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");

  // Deploy the contract and get the deployed contract instance
  const nftCollection = await NFTCollection.deploy("My NFT Collection", "MNFT");

  // Wait until the contract is deployed
  await nftCollection.deployed();

  console.log("NFTCollection deployed to:", nftCollection.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
