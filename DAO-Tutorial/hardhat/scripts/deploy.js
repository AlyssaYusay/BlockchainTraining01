const hre = require("hardhat");

async function main() {
  const FakeNFTMarketplace = await ethers.getContractFactory(
    "FakeNFTMarketplace"
  );
  const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
  await fakeNftMarketplace.deployed();

  console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);

  const CryptoDevsDAO = await ethers.getContractFactory("CryptoDevsDAO");
  const cryptoDevsDAO = await CryptoDevsDAO.deploy(
    fakeNftMarketplace.address,
    "0x3F7b06fdAca79228A1Cd13dcf01B63a9c86A973f", //CyrptoDevsNFTSC
    {
      value: ethers.utils.parseEther("0.1"),
    }
  );

  await cryptoDevsDAO.deployed();

  console.log("CryptoDevsDAO deployed to: ", cryptoDevsDAO.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//CryptoDevs (NFT SC) deployed at 0x3F7b06fdAca79228A1Cd13dcf01B63a9c86A973f
// FakeNFTMarketplace deployed to:  0x7831a9dacB2B6C83058a5d1Cf47a00A4186143dC
// CryptoDevsDAO deployed to:  0x378F7754d616d2709ee3895c7e64dd72B153E88D
