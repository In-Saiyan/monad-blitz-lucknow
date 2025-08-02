// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CTNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct EventNFT {
        string eventId;
        uint256 rank;
        uint256 score;
        string tier; // LEGENDARY, EPIC, RARE, COMMON
        uint256 timestamp;
    }

    mapping(uint256 => EventNFT) public eventNFTs;
    mapping(string => bool) public validEvents;

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string eventId,
        uint256 rank,
        string tier
    );

    constructor() ERC721("Capture The NFT", "CTNFT") Ownable(msg.sender) {}

    function addValidEvent(string memory eventId) external onlyOwner {
        validEvents[eventId] = true;
    }

    function mintNFT(
        address to,
        string memory eventId,
        uint256 rank,
        uint256 score,
        string memory tier,
        string memory uri
    ) public onlyOwner returns (uint256) {
        require(validEvents[eventId], "Invalid event ID");
        require(bytes(tier).length > 0, "Tier cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        eventNFTs[tokenId] = EventNFT({
            eventId: eventId,
            rank: rank,
            score: score,
            tier: tier,
            timestamp: block.timestamp
        });

        emit NFTMinted(to, tokenId, eventId, rank, tier);
        return tokenId;
    }

    function batchMintNFTs(
        address[] memory recipients,
        string memory eventId,
        uint256[] memory ranks,
        uint256[] memory scores,
        string[] memory tiers,
        string[] memory tokenURIs
    ) external onlyOwner {
        require(
            recipients.length == ranks.length &&
            recipients.length == scores.length &&
            recipients.length == tiers.length &&
            recipients.length == tokenURIs.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            mintNFT(recipients[i], eventId, ranks[i], scores[i], tiers[i], tokenURIs[i]);
        }
    }

    function getUserNFTs(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory userTokens = new uint256[](balance);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == user) {
                userTokens[currentIndex] = i;
                currentIndex++;
            }
        }

        return userTokens;
    }

    function getEventNFT(uint256 tokenId) external view returns (EventNFT memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return eventNFTs[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
