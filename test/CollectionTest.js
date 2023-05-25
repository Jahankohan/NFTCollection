const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection", function () {
  let NFTCollection;
  let nftCollection;
  let owner;
  const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
  const PAUSER_ROLE = ethers.utils.id("PAUSER_ROLE");
  const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");

  beforeEach(async function () {
    NFTCollection = await ethers.getContractFactory("NFTCollection");
    [owner] = await ethers.getSigners();

    nftCollection = await NFTCollection.deploy("My NFT Collection", "MNFT");
    await nftCollection.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right roles to the owner", async function () {
      expect(
        await nftCollection.hasRole(DEFAULT_ADMIN_ROLE, owner.address)
      ).to.equal(true);
      expect(await nftCollection.hasRole(PAUSER_ROLE, owner.address)).to.equal(
        true
      );
      expect(await nftCollection.hasRole(MINTER_ROLE, owner.address)).to.equal(
        true
      );
    });
  });

  describe("Pause and unpause", function () {
    it("Should be able to pause and unpause", async function () {
      await nftCollection.pause();
      expect(await nftCollection.paused()).to.equal(true);

      await nftCollection.unpause();
      expect(await nftCollection.paused()).to.equal(false);
    });

    it("Should not allow non-pauser to pause or unpause", async function () {
      // Choose a random account
      const [_, randomAccount] = await ethers.getSigners();

      await expect(
        nftCollection.connect(randomAccount).pause()
      ).to.be.revertedWith(
        "AccessControl: account " +
          randomAccount.address.toLowerCase() +
          " is missing role " +
          PAUSER_ROLE
      );

      await expect(
        nftCollection.connect(randomAccount).unpause()
      ).to.be.revertedWith(
        "AccessControl: account " +
          randomAccount.address.toLowerCase() +
          " is missing role " +
          PAUSER_ROLE
      );
    });
  });

  describe("Minting", function () {
    it("Should mint a new token", async function () {
      const tokenURI = "https://my-nft-collection/metadata/1";
      const tokenId = 1; // For the first token

      // Mint a new token
      await nftCollection.safeMint(owner.address, tokenURI);

      // Check that the token was minted to the owner and has the correct token URI
      expect(await nftCollection.ownerOf(tokenId)).to.equal(owner.address);
      expect(await nftCollection.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should not allow non-minter to mint", async function () {
      const [_, randomAccount] = await ethers.getSigners();
      const tokenURI = "https://my-nft-collection/metadata/1";

      // Try to mint a new token from a random account
      await expect(
        nftCollection
          .connect(randomAccount)
          .safeMint(randomAccount.address, tokenURI)
      ).to.be.revertedWith(
        "AccessControl: account " +
          randomAccount.address.toLowerCase() +
          " is missing role " +
          MINTER_ROLE
      );
    });
  });

  describe("Events", function () {
    it("Should emit CollectionCreated event on deployment", async function () {
      const name = "My NFT Collection";
      const symbol = "MNFT";

      const NFTCollection = await ethers.getContractFactory("NFTCollection");
      const nftCollection = await NFTCollection.deploy(name, symbol);
      await nftCollection.deployed();

      const receipt = await nftCollection.deployTransaction.wait();

      expect(receipt.events?.filter((x) => x.event === "CollectionCreated")).to
        .not.be.empty;
    });

    it("Should emit TokenMinted event when minting a token", async function () {
      const tokenURI = "https://my-nft-collection/metadata/1";
      const tokenId = 1;

      const tx = await nftCollection.safeMint(owner.address, tokenURI);
      const receipt = await tx.wait();

      const TokenMinted = receipt.events?.filter(
        (x) => x.event === "TokenMinted"
      );

      expect(TokenMinted).to.not.be.empty;

      // Check each argument manually
      expect(TokenMinted[0].args.collection).to.equal(nftCollection.address);
      expect(TokenMinted[0].args.recipient).to.equal(owner.address);
      expect(TokenMinted[0].args.tokenId).to.equal(
        ethers.BigNumber.from(tokenId)
      );
      expect(TokenMinted[0].args.tokenUri).to.equal(tokenURI);
    });
  });
});
