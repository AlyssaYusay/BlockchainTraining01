const hre = require("hardhat");

async function main() {
  const ExchangeSmartContract = await ethers.getContractFactory("Exchange");

  const exchangeSmartContract = await ExchangeSmartContract.deploy(
    "0xF96D32D80c5eB6bb8EB56BA4Fc421a87058A63E9" //CyrptoDevsTokenSC
  );

  await exchangeSmartContract.deployed();

  console.log(
    "ExchangeSmartContract deployed to: ",
    exchangeSmartContract.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//Exchange Smart Contract deployed to 0x3b3BF744Dc63636AD60340B9952193Ddb18bC9cE
