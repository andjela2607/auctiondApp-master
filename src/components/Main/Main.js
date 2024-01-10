import React, { useState, useEffect } from 'react';
import AuctionList from '../AuctionList/AuctionList.js'; 
import CreateAuctionModal from '../CreateAuctionModal/CreateAuctionModal.js'; 
import Web3 from 'web3';
import './Main.css';
const auctionFactoryAddress = "0x964eac08ceA85D22f27Ed61467ecEba5D9842D61";
const sepoliaRPCUrl = "https://sepolia.infura.io/v3/fcf4f98ff352481195c0d5b0989c0c9f";

const Main = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        console.log("Connected to Ethereum account: ", accounts[0]);
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0]);
          console.log("Switched to account: ", newAccounts[0]);
        });
      } else {
        console.log("MetaMask is not installed.");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask: ", error);
    }
  };
  

  useEffect(() => {
    const web3Instance = new Web3(sepoliaRPCUrl);
    console.log(web3Instance);
    setWeb3(web3Instance);
    connectWallet();
    console.log("Web3 instance set up: ", web3);
  }, []);

  return (
    <div className="main-container">
      {!account && (
        <button className="connect-wallet-button" onClick={connectWallet}>
          Poveži se sa MetaMaskom
        </button>
      )}
      
      <AuctionList className="auction-list" web3={web3} account={account} auctionFactoryAddress={auctionFactoryAddress}/>
      <button className="create-auction-button" onClick={() => setShowCreateModal(true)}>
        Napravi Aukciju
      </button>
      {showCreateModal && (
        <CreateAuctionModal className="create-auction-modal" web3={web3} account={account} onClose={() => setShowCreateModal(false)} auctionFactoryAddress = {auctionFactoryAddress}/>
      )}
      
    </div>
  );
}

export default Main;