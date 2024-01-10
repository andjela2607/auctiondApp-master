import React, { useState } from 'react';
import AuctionFactoryABI from '../../contracts/AuctionFactory.json';
import './CreateAuctionModal.css'

const CreateAuctionModal = ({ onClose, web3, account, auctionFactoryAddress}) => {
  const [auctionData, setAuctionData] = useState({
    biddingTime: '',
    beneficiaryAddress: '',
    secret: ''
  });

  const handleChange = (e) => {
    setAuctionData({ ...auctionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
      console.log('MetaMask is not installed or not connected!');
      return;
    }
    if (!web3 || !account) {
      alert("Web3 instance or account is not available.");
      return;
    }
    try {
      const auctionFactory = new web3.eth.Contract(AuctionFactoryABI.abi, auctionFactoryAddress);
  
      const transactionParameters = {
        to: auctionFactoryAddress,
        from: account,
        data: auctionFactory.methods.createAuction(
          auctionData.biddingTime,
          auctionData.beneficiaryAddress,
          auctionData.secret
        ).encodeABI() // call to contract method
      };

      // txHash is a hex string
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
  
      console.log("Transaction Hash:", txHash);
      onClose();
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };
  
  return (
    <div className="create-auction-modal">
      <div className="modal-content">
        <input className="modal-input" name="biddingTime" type="number" placeholder="Bidding Time" onChange={handleChange} />
        <input className="modal-input" name="beneficiaryAddress" placeholder="Beneficiary Address" onChange={handleChange} />
        <input className="modal-input" name="secret" placeholder="Secret Message" onChange={handleChange} />
        <button className="modal-button" onClick={handleSubmit}>Create Auction</button>
        <button className="modal-button cancel-button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateAuctionModal;
