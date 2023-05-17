const hre = require("hardhat");

async function main() {
  const CryptoDevsTokenContract = await hre.ethers.getContractFactory("CryptoDevsToken");
  const deployedCryptoDevsTokenContract = await CryptoDevsTokenContract.deploy('0x3F7b06fdAca79228A1Cd13dcf01B63a9c86A973f');
  await deployedCryptoDevsTokenContract.deployed();
  console.log(`Deployed to ${deployedCryptoDevsTokenContract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
