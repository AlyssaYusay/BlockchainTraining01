import "./App.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "./constants";

function App() {
  //1. Initialize Variables here
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const web3ModalRef = useRef();

  //2. Declare functions that can be called in the return statement

  //this function returns provider or signer if needed
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

  //Function to add wallet address to the whitelist

  const addAddressToWhitelist = async () => {
    try {
      //we NEED signer, let's call getProviderOrSigner function
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to get the number of whitelisted
  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider //provider -> abi -> Whitelist_Contract_Address ->
      );

      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();

      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to checkiFAddress is already on the whitelist
  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer //provider -> abi -> Whitelist_Contract_Address ->
      );

      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to connect wallet

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (error) {
      console.error(error);
    }
  };

  //Function to call different buttons based on the state
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className="description">
            <p className="whitelistMessage">Thanks for joining the Whitelist!</p>
          </div>
        );
      } else if (loading) {
        return <button className="button">Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className="button">
            Join the Whitelist!
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className="button">
          Connect Your Wallet{" "}
        </button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "80001",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      // connectWallet();
      
    }
  }, [walletConnected]);

  return (
    <>
      <div className="main ">
        <div className="border">
          <h1 className="title">Welcome to Crypto Devs</h1>
          <div className="description">
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className="description">
            <span className="whitelistNum">{numberOfWhitelisted}</span> have
            already joined the whitelist.
          </div>
          <div>{renderButton()}</div>
          <div>
            <img src="" />
          </div>
        </div>
      </div>
      <footer className="footer">Made with &#10084; by Crypto Devs</footer>
    </>
  );
}

export default App;

//call the wallet without the wallet appearing
