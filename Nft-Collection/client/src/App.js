import "./App.css";
import Web3Modal from "web3modal";
import { utils, providers, Contract } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import { NFT_CONTRACT_ADDRESS, abi } from "./constants";

function App() {
  //1. Initialized hooks and variables
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef(); //access wallet when loading page

  //2. Declare functions

  //Mint NFT during presale period
  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      // 0.01 = 10000000000000000000000
      // if frontend = use parseEther()
      // blockchain = use parseFormater()
      setLoading(true);
      await tx; //wait for the result to avoid errors
      setLoading(false);
      window.alert("You have successfully minted a Crypto Dev!");
    } catch (error) {
      console.error(error);
    }
  };

  //to mint NFT after the presale period
  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      //value == msg.value in SC
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });

      setLoading(true);
      await tx; //wait for the result to avoid errors
      setLoading(false);
      window.alert("You have successfully minted a Crypto Dev!");
    } catch (error) {
      console.error(error);
    }
  };

  //EOA && CA
  //EOA - Metamask (private key)
  //CA - (NO private key)

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to start Presale
  // During preSale, discounted prices, time is limited, exclusivity
  // These are for those who whitelisted
  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      //can add more implementation
      setLoading(false);

      window.alert("Presale has started!");
      // await checkIfPresaleStarted();
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    // can be imporoved??
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _presaleStarted = await nftContract.presaleStarted();

      setLoading(true);
      await _presaleStarted.wait();
      setLoading(false);

      //if it is false get the owner
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (error) {
      console.error(error);
    }
  };

  // check if presaleEnded
  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _preSaleEnded = await nftContract.presaleEnded();

      const hasEnded = Math.floor(Date.now) / 1000 >= presaleEnded;
      //will throw true or false (if else)
      // const hasEnded = _preSaleEnded.lt(Math.floor(Date.now) / 1000);

      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }

      return hasEnded;
    } catch (error) {
      console.error(error);
    }
  };

  //function to get Owner
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _owner = await nftContract.owner();

      const signer = await getProviderOrSigner(true);

      const address = await signer.getAddress();

      if (address === _owner) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  //function to get the number of tokenIds that have been minted
  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi
        // provider
      );
      const _tokenIds = await nftContract.tokenIds();
      setTokenIdsMinted(_tokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  };

  //return provider or signer
  const getProviderOrSigner = async (needSigner = false) => {
    // Eth Wallet injects info to the webpage
    const provider = await web3ModalRef.current.connect();

    // Ask user if they want to connect wallet
    const web3Provider = new providers.Web3Provider(provider);

    // Ask user to connect this specific network
    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 80001) {
      window.alert("Change to Mumbai network");
      throw new Error("Change network to Mumbai!");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "80001",
        providerOptions: {}, //rpc url
        disableInjectedProvider: false, //can be removed or not
      });
      // connectWallet();
    }

    const _presaleStarted = checkIfPresaleStarted();

    if (_presaleStarted) {
      checkIfPresaleEnded();
    }

    getTokenIdsMinted();

    const presaleEndedInterval = setInterval(async function () {
      const _presaleStarted = await checkIfPresaleStarted();
      if (_presaleStarted) {
        const _presaleEnded = await checkIfPresaleEnded();
        if (_presaleEnded) {
          clearInterval(presaleEndedInterval);
        }
      }
    }, 5 * 1000);

    setInterval(async function () {
      await getTokenIdsMinted();
    }, 5 * 1000);

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return <button onClick={connectWallet}>Connect your wallet</button>;
    }

    if (loading) {
      return <button>Loading...</button>;
    }

    if (isOwner && !presaleStarted) {
      return <button onClick={startPresale}>Start Presale!</button>;
    }

    if (!presaleStarted) {
      return (
        <div>
          <div>Presale hasn&#39;t started!</div>
        </div>
      );
    }

    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div>
            Presale has started!!! If your address is Whitelisted, Mint a Crypto
            Dev
          </div>
          <button onClick={presaleMint} className="button">
            Presale Mint
          </button>
        </div>
      );
    }

    // If presale started and has ended, it's time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <button onClick={publicMint} className="button">
          Public Mint
        </button>
      );
    }
  };

  return (
    <div>
      <div className="main">
        <div>
          <h1 className="title">Welcome to Crypto Devs!</h1>
          <div className="description">
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className="description">
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          {/* <img className={styles.image}" src="./cryptodevs/0.svg" /> */}
        </div>
        "
      </div>

      <footer className="footer">Made with &#10084; by Crypto Devs</footer>
    </div>
  );
}

export default App;
