// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertGenRegistry
 * @dev A simple registry to anchor certificate batch Merkle roots on the blockchain.
 */
contract CertGenRegistry {
    address public admin;
    
    // Maps Merkle Root to the block timestamp of when it was anchored
    mapping(bytes32 => uint256) public anchoredBatches;
    
    // Maps Merkle Root to a metadata URI (optional, e.g. IPFS link to batch details)
    mapping(bytes32 => string) public batchURIs;

    event BatchAnchored(bytes32 indexed merkleRoot, string batchURI, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == admin, "Only admin can anchor batches");
        _;
    }

    /**
     * @dev Anchors a new Merkle Root to the blockchain.
     * @param _merkleRoot The root hash of the certificate batch.
     * @param _batchURI Optional URI containing batch metadata.
     */
    function anchorBatch(bytes32 _merkleRoot, string calldata _batchURI) external onlyOwner {
        require(anchoredBatches[_merkleRoot] == 0, "Batch already anchored");
        
        anchoredBatches[_merkleRoot] = block.timestamp;
        batchURIs[_merkleRoot] = _batchURI;
        
        emit BatchAnchored(_merkleRoot, _batchURI, block.timestamp);
    }

    /**
     * @dev Checks if a Merkle Root is anchored and returns its timestamp.
     */
    function isAnchored(bytes32 _merkleRoot) external view returns (bool, uint256, string memory) {
        uint256 timestamp = anchoredBatches[_merkleRoot];
        return (timestamp > 0, timestamp, batchURIs[_merkleRoot]);
    }

    /**
     * @dev Allows the admin to transfer ownership.
     */
    function transferOwnership(address _newAdmin) external onlyOwner {
        require(_newAdmin != address(0), "New admin cannot be zero address");
        admin = _newAdmin;
    }
}
