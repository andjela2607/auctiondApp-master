import React, { useState, useEffect } from 'react';
import AuctionABI from '../../contracts/Auction.json';
import './AuctionDetails.css'

const AuctionDetailsModal = ({ auction, onClose, web3, account }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [highestBid, setHighestBid] = useState(null);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidsHistroy, setBidsHistory] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const calculateTimeLeft = (endTime) => {
    const currentTime = Math.floor(Date.now() / 1000); // time in seconds
    const timeLeftInSeconds = Number(endTime) - currentTime;

    if (timeLeftInSeconds > 0) {
      const hours = Math.floor(timeLeftInSeconds / 3600);
      const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
      const seconds = timeLeftInSeconds % 60;

      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return "Auction ended";
    }
  };

  const loadAuctionDetails = async () => {
    if (web3 && auction) {
      const auctionContract = new web3.eth.Contract(AuctionABI.abi, auction);

      const highestBid = await auctionContract.methods.highestBid().call();
      const highestBidder = await auctionContract.methods.highestBidder().call();
      const auctionEndTime = await auctionContract.methods.auctionEndTime().call();
      const userBids = await auctionContract.methods.getHistory().call();
      setBidsHistory(userBids)

      setHighestBid(highestBid);
      setHighestBidder(highestBidder);
      setTimeLeft(calculateTimeLeft(auctionEndTime));
      
    }
  };

  useEffect(() => {
    loadAuctionDetails();
    const auctionDataInterval = setInterval(loadAuctionDetails, 5000);

    const countdownInterval = setInterval(() => {
      if (web3 && auction) {
        const auctionContract = new web3.eth.Contract(AuctionABI.abi, auction);
        auctionContract.methods.auctionEndTime().call()
          .then(auctionEndTime => {
            setTimeLeft(calculateTimeLeft(auctionEndTime));
          });
      }
    }, 1000);

    return () => {
      clearInterval(auctionDataInterval);
      clearInterval(countdownInterval);
    };
  }, [web3, auction]);

  const placeBid = async () => {
    if (!web3 || !auction || !account) {
      alert("Web3 instance, contract address, or account is not available.");
      return;
    }

    if (!bidAmount || Number(bidAmount) <= 0) {
      console.log("Invalid bid amount.");
      return;
    }

    try {
      const auctionContract = new web3.eth.Contract(AuctionABI.abi, auction);
      const bidAmountWei = web3.utils.toWei(bidAmount, 'ether');

      console.log("Bid Amount (Ether):", bidAmount);
      console.log("Bid Amount (Wei):", bidAmountWei);

      const transactionParameters = {
        to: auction,
        from: account,
        value: web3.utils.toHex(bidAmountWei),
        data: auctionContract.methods.bid().encodeABI()
      };


      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log("Transaction Hash:", txHash);
      console.log("Bid successfully placed.");
    } catch (error) {
      console.error("Error placing bid: ", error);
    }
  };

  const endAuction = async () => {
    if (!web3 || !auction || !account) {
      alert("Web3 instance, contract address, or account is not available.");
      return;
    }

    try {
      const auctionContract = new web3.eth.Contract(AuctionABI.abi, auction);

      const transactionParameters = {
        to: auction,
        from: account,
        data: auctionContract.methods.auctionEnd().encodeABI()
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log("Auction ended successfully. Transaction Hash:", txHash);
    } catch (error) {
      console.error("Error ending auction: ", error);
    }
  };

  const withdraw = async () => {
    if (!web3 || !auction || !account) {
      alert("Web3 instance, contract address, or account is not available.");
      return;
    }

    try {
      const auctionContract = new web3.eth.Contract(AuctionABI.abi, auction);

      const transactionParameters = {
        to: auction,
        from: account,
        data: auctionContract.methods.withdraw().encodeABI()
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log("Withdrawal successful. Transaction Hash:", txHash);
    } catch (error) {
      console.error("Error during withdrawal: ", error);
    }
  };

  const getSecretMessage = async () => {
    if (!web3 || !auction) {
      alert("Web3 instance or contract address is not available.");
      return;
    }

    try {
      const auctionContract = new web3.eth.Contract(AuctionABI.abi, auction);
      const currentHighestBidder = await auctionContract.methods.highestBidder().call();

      if (account.toLowerCase() !== currentHighestBidder.toLowerCase()) {
        alert("Only the auction winner can access the secret message.");
        return;
      }

      const secret = await auctionContract.methods.getSecretMessage().call({ from: account });
      alert(`Secret Message: ${secret}`);
    } catch (error) {
      console.error("Error fetching secret message:", error);
      alert("Failed to fetch the secret message. See console for details.");
    }
  };



  return (
    <div className="auction-details-modal">
      <h2 className="modal-title">Auction Details</h2>
      <p className="auction-info">Auction Contract Address: {auction}</p>
      <p className="auction-info">Time Left: {timeLeft}</p>
      <p className="auction-info">Highest Bid: {highestBid ? web3.utils.fromWei(highestBid, 'ether') : '0'} ETH</p>
      <p className="auction-info">Highest Bidder: {highestBidder}</p>
      <p className="auction-info">Your bids: {bidsHistroy?.length ? bidsHistroy.map(
        (bid) => (
          <span key={bid}>
            {bid},
          </span>
        )
      ) : 'No bids'}</p>

      {timeLeft !== "Auction ended" && (
        <div className="bid-section">
          <input type="number" className="bid-input" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Your Bid" />
          <button className="bid-button" onClick={placeBid}>Place Bid</button>
        </div>
      )}

      <button className="action-button" onClick={endAuction}>End Auction</button>
      <button className="action-button" onClick={withdraw}>Withdraw</button>
      {timeLeft === "Auction ended" && (
        <button className="action-button" onClick={getSecretMessage}>Get Secret Message</button>
      )}
      <button className="close-button" onClick={onClose}>Close</button>
    </div>
  );
};

export default AuctionDetailsModal;
