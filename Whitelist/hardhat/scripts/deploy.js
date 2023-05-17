//need ethers package
//ethersJS - used to interact with smart contract 
//ethers is included when you installed 
const { ethers } = require("hardhat");

async function main() {
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  // we deploy the smart contract and add the uint in the parameters of the constructor
  //10 for maxnumber of whitelistcontract
  const deployedWhitelistContract = await whitelistContract.deploy(10);
  
  // Wait for deployment to be finished
  await deployedWhitelistContract.deployed();

  // console.log the smart contract address
  console.log("Whitelist Contract Address:", deployedWhitelistContract.address);
}

// Need to call the "main" function
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });