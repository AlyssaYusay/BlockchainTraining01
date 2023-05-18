async function getAccounts() {
  const ethAccounts = await provider.send("eth_requestAccounts", []);
  //   console.log(ethAccounts);
  document.getElementById("button").innerHTML =
    ethAccounts[0].slice(0, 10) + "...";
}

//II. Signer
const signer = provider.getSigner();
// console.log(signer);

async function _getAddress() {
  const address = await signer.getAddress();
  console.log(`this is the signer: ${address}`);
}

//Get chain ID
async function _getChainId() {
  const id = await signer.getChainId();
  console.log(`this is the Chain Id: ${id}`);
}

//get the gas price
async function _getGasPrice() {
  const gasPrice = await signer.getGasPrice();
  console.log(ethers.utils.formatEther(gasPrice));

  // document.getElementById("button").innerHTML =
  // gasPrice;
}

//to connect wallet
async function connectWallet() {
  const address = await signer.getAddress();
  const id = await signer.getChainId();

  document.getElementById("button").innerHTML =
    address.slice(0, 10) + "..." + id;
}

//1. connect metamask by injecting Web3 Provider on our page
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// console.log(provider);

// async function getAccounts() {
//   const ethAccounts = await provider.send("eth_requestAccounts", []);
//   console.log(typeof ethAccounts[0]);
// } --------------- 5/18 review connecting to Metamask
