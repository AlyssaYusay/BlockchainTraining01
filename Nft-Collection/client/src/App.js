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
  const [isOwner, setOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef(); //access wallet when loading page

  //2. Declare functions

  //Mint NFT during presale period
  const presaleMint = async () => {
    try {
      // const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi
        // signer
      );

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
      // const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi
        // signer
      );

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

  return <div className="App"></div>;
}

export default App;
