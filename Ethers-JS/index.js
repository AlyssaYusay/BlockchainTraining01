//1. connect metamask by injecting Web3 Provider on our page
let signer;
let message = "Hallo Lalalaluuu!";
let mnemonic =
  "sauce execute true love rebel juice diesel story employ globe advance balance";

async function _signMessage() {
  //digitalSignature =  hallo somehting
  const digitalSignature = await signer.signMessage(message);
  console.log(`This is the Digital Signature: ${digitalSignature}`);
}

//WALLET
async function _privateKey() {
  const privateKeyAddress = await new ethers.Wallet.fromMnemonic(mnemonic);
  console.log(privateKeyAddress.address);

  const publicKeyAddress = privateKeyAddress.publicKey;
  console.log(`This is the Public Key: ${publicKeyAddress}`);
}

async function _randomPrivateKey() {
  // const wallet = randomPrivateKey.connect(provider);
  // console.log(wallet);
}

async function getAccounts() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const randomPrivateKey = await ethers.Wallet.createRandom();
  // console.log(`Random Private Key: ${randomPrivateKey.address}`);

  // const publicKeyAddress = randomPrivateKey.publicKey;
  // console.log(`Random Public Key:${publicKeyAddress}`);

  // const wallet = randomPrivateKey.connect(provider);

  // const bal = await wallet.getBalance();
  // console.log(`balance: ${bal}`);

  // const chainIDs = await wallet.getChainId();
  // console.log(`Chain ID: ${chainIDs}`);

  // const gasPrice = await wallet.getGasPrice();
  // console.log(`This is the current gas price: ${ethers.utils.formatEther(gasPrice)}`);

  const lyzPrivateKey = "0x04c2Dd1285806b16Da0698aDA50fF336bc7757c0";
  const princessPublicKey = "0x043d70ae0f7d2277207e4051f262cef715b025f1";

  const Lyzmnemonic =
    "sauce execute true love rebel juice diesel story employ globe advance balance";

  const privateKeyAddress = await new ethers.Wallet.fromMnemonic(Lyzmnemonic);

  const wallet = privateKeyAddress.connect(provider);
  const balance = await wallet.getBalance();
  console.log(balance);

  const signedTx = await privateKeyAddress.signTransaction({
    value: balance,
    to: "0x043d70ae0f7d2277207e4051f262cef715b025f1",
    gasLimit: 0x5208,
  });

  console.log(
    `Transaction successful, this is the digital signature ${signedTx}`
  );

  provider
    .send("eth_requestAccounts", [])
    .then(() => {
      provider.listAccounts().then((accounts) => {
        signer = provider.getSigner(accounts[0]);
        document.getElementById("button").innerHTML =
          accounts[0].slice(0, 5) + "..." + accounts[0].slice(38, 42);

        // _getAddress();
        // _getChainId();
        // _getGasPrice();
        // _getTransactionCount();
        // _signMessage();
        // _privateKey();
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

async function _getAddress() {
  const address = await signer.getAddress();
  console.log(`This is the Wallet Address: ${address}`);
}

async function _getChainId() {
  const chainID = await signer.getChainId();
  console.log(`This is the Chain ID of this account: ${chainID}`);
}

async function _getGasPrice() {
  const gasPrice = await signer.getGasPrice();
  console.log(
    `This is the current gas price: ${ethers.utils.formatEther(gasPrice)}`
  );
}

async function _getTransactionCount() {
  const txCount = await signer.getTransactionCount("latest");
  console.log(`This is the number of transaction done: ${txCount}`);
}
