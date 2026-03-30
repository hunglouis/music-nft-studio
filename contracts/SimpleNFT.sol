// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SimpleNFT is ERC721URIStorage {
    uint256 public nextTokenId;

    constructor() ERC721("MusicNFT", "MNFT") {}

    function mint(address to, string memory tokenURI) external {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI); // Lưu link JSON vào đây
        nextTokenId++;
    }
}
