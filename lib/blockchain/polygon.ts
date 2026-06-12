import { ethers } from "ethers";

const ABI = [
  "function anchorBatch(bytes32 _merkleRoot, string calldata _batchURI) external",
  "function isAnchored(bytes32 _merkleRoot) external view returns (bool, uint256, string memory)"
];

const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.POLYGON_CONTRACT_ADDRESS;

/**
 * Anchors a Merkle Root to the Polygon blockchain.
 */
export async function anchorRootOnChain(merkleRoot: string, batchId: string): Promise<string | null> {
  if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn("[BLOCKCHAIN] Missing credentials. Skipping on-chain anchoring.");
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    // Merkle root should be bytes32 (hex string starting with 0x)
    const formattedRoot = merkleRoot.startsWith("0x") ? merkleRoot : `0x${merkleRoot}`;
    
    console.log(`[BLOCKCHAIN] Anchoring root ${formattedRoot} for batch ${batchId}`);
    
    const tx = await contract.anchorBatch(formattedRoot, batchId);
    const receipt = await tx.wait();
    
    console.log(`[BLOCKCHAIN] Batch anchored successfully: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    console.error("[BLOCKCHAIN_ANCHOR_ERROR]", error);
    return null;
  }
}

/**
 * Verifies if a Merkle Root is anchored on-chain.
 */
export async function verifyRootOnChain(merkleRoot: string): Promise<{ anchored: boolean; timestamp: number; batchURI: string }> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS!, ABI, provider);
    const formattedRoot = merkleRoot.startsWith("0x") ? merkleRoot : `0x${merkleRoot}`;
    
    const [anchored, timestamp, batchURI] = await contract.isAnchored(formattedRoot);
    return { anchored, timestamp: Number(timestamp), batchURI };
  } catch (error) {
    console.error("[BLOCKCHAIN_VERIFY_ERROR]", error);
    return { anchored: false, timestamp: 0, batchURI: "" };
  }
}
