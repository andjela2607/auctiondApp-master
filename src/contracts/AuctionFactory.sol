// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./Auction.sol";

contract AuctionFactory {
    Auction[] public auctions;

    function createAuction(uint biddingTime, address payable beneficiary, string memory secret) public {
        Auction newAuction = new Auction(biddingTime, beneficiary, secret);
        auctions.push(newAuction);
    }

    function getAllAuctions() public view returns (Auction[] memory) {
        return auctions;
    }
}