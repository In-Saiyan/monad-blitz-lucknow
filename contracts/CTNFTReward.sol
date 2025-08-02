// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CTNFTReward
 * @dev NFT contract for CTNFT platform rewards
 * Supports tiered NFTs based on user performance in CTF events
 */
contract CTNFTReward is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // NFT Tiers
    enum NFTTier {
        COMMON,    // All participants
        RARE,      // Top 25%
        EPIC,      // Top 10%
        LEGENDARY  // Top 1%
    }

    // Event structure
    struct CTFEvent {
        string name;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalParticipants;
        mapping(address => bool) hasReceived;
    }

    // NFT metadata structure
    struct NFTMetadata {
        uint256 eventId;
        NFTTier tier;
        uint256 rank;
        uint256 score;
        string eventName;
        uint256 mintTimestamp;
    }

    // Mappings
    mapping(uint256 => CTFEvent) public events;
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(NFTTier => string) public tierBaseURIs;
    
    uint256 public eventCounter;

    // Events
    event EventCreated(uint256 indexed eventId, string name, uint256 startTime, uint256 endTime);
    event NFTMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 indexed eventId,
        NFTTier tier,
        uint256 rank,
        uint256 score
    );

    constructor() ERC721("CTNFT Reward", "CTNFT") {}

    /**
     * @dev Create a new CTF event
     * @param name Event name
     * @param startTime Event start timestamp
     * @param endTime Event end timestamp
     */
    function createEvent(
        string memory name,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        require(startTime < endTime, "Invalid time range");
        
        uint256 eventId = eventCounter++;
        CTFEvent storage newEvent = events[eventId];
        newEvent.name = name;
        newEvent.startTime = startTime;
        newEvent.endTime = endTime;
        newEvent.isActive = true;
        newEvent.totalParticipants = 0;

        emit EventCreated(eventId, name, startTime, endTime);
        return eventId;
    }

    /**
     * @dev Mint NFT reward for a participant
     * @param recipient Address to receive the NFT
     * @param eventId Event ID
     * @param rank Final rank of the participant
     * @param score Final score of the participant
     * @param totalParticipants Total number of participants
     */
    function mintReward(
        address recipient,
        uint256 eventId,
        uint256 rank,
        uint256 score,
        uint256 totalParticipants
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(eventId < eventCounter, "Event does not exist");
        require(!events[eventId].hasReceived[recipient], "Already received NFT");
        
        CTFEvent storage ctfEvent = events[eventId];
        require(block.timestamp > ctfEvent.endTime, "Event not ended");
        
        // Determine NFT tier based on rank percentile
        NFTTier tier = _determineTier(rank, totalParticipants);
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Store NFT metadata
        nftMetadata[tokenId] = NFTMetadata({
            eventId: eventId,
            tier: tier,
            rank: rank,
            score: score,
            eventName: ctfEvent.name,
            mintTimestamp: block.timestamp
        });

        // Mark as received
        ctfEvent.hasReceived[recipient] = true;
        
        // Mint NFT
        _safeMint(recipient, tokenId);
        
        // Set token URI based on tier
        string memory tokenURI = _generateTokenURI(tokenId, tier);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(recipient, tokenId, eventId, tier, rank, score);
    }

    /**
     * @dev Batch mint NFTs for multiple participants
     * @param recipients Array of recipient addresses
     * @param eventId Event ID
     * @param ranks Array of ranks
     * @param scores Array of scores
     * @param totalParticipants Total number of participants
     */
    function batchMintRewards(
        address[] calldata recipients,
        uint256 eventId,
        uint256[] calldata ranks,
        uint256[] calldata scores,
        uint256 totalParticipants
    ) external onlyOwner {
        require(
            recipients.length == ranks.length && ranks.length == scores.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (!events[eventId].hasReceived[recipients[i]]) {
                mintReward(recipients[i], eventId, ranks[i], scores[i], totalParticipants);
            }
        }
    }

    /**
     * @dev Set base URI for a specific tier
     * @param tier NFT tier
     * @param baseURI Base URI for the tier
     */
    function setTierBaseURI(NFTTier tier, string memory baseURI) external onlyOwner {
        tierBaseURIs[tier] = baseURI;
    }

    /**
     * @dev End an event
     * @param eventId Event ID
     */
    function endEvent(uint256 eventId) external onlyOwner {
        require(eventId < eventCounter, "Event does not exist");
        events[eventId].isActive = false;
    }

    /**
     * @dev Get NFT metadata for a token
     * @param tokenId Token ID
     */
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Check if user has received NFT for an event
     * @param eventId Event ID
     * @param user User address
     */
    function hasReceivedNFT(uint256 eventId, address user) external view returns (bool) {
        return events[eventId].hasReceived[user];
    }

    /**
     * @dev Determine NFT tier based on rank percentile
     * @param rank User's rank (1-based)
     * @param totalParticipants Total participants
     */
    function _determineTier(uint256 rank, uint256 totalParticipants) internal pure returns (NFTTier) {
        uint256 percentile = (rank * 100) / totalParticipants;
        
        if (percentile <= 1) {
            return NFTTier.LEGENDARY; // Top 1%
        } else if (percentile <= 10) {
            return NFTTier.EPIC;      // Top 10%
        } else if (percentile <= 25) {
            return NFTTier.RARE;      // Top 25%
        } else {
            return NFTTier.COMMON;    // All others
        }
    }

    /**
     * @dev Generate token URI for an NFT
     * @param tokenId Token ID
     * @param tier NFT tier
     */
    function _generateTokenURI(uint256 tokenId, NFTTier tier) internal view returns (string memory) {
        string memory baseURI = tierBaseURIs[tier];
        if (bytes(baseURI).length > 0) {
            return string(abi.encodePacked(baseURI, "/", _toString(tokenId), ".json"));
        }
        return "";
    }

    /**
     * @dev Convert uint256 to string
     * @param value Number to convert
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
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
