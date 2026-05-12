// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarketplace is ReentrancyGuard {

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(address => mapping(uint256 => Listing))
        public listings;

    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {

        IERC721(nftContract).transferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        listings[nftContract][tokenId] =
            Listing(msg.sender, price);
    }

    function buyItem(
        address nftContract,
        uint256 tokenId
    ) external payable {

        Listing memory item =
            listings[nftContract][tokenId];

        require(
            msg.value >= item.price,
            "Not enough ETH"
        );

        payable(item.seller)
            .transfer(msg.value);

        IERC721(nftContract).transferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        delete listings[nftContract][tokenId];
    }
}