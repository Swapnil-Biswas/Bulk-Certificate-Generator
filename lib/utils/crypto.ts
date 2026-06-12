import { MerkleTree } from "merkletreejs";
import CryptoJS from "crypto-js";

/**
 * Generates a SHA-256 hash of the given data.
 */
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Constructs a Merkle Tree from a list of hashes.
 */
export function createMerkleTree(hashes: string[]): MerkleTree {
  return new MerkleTree(hashes, CryptoJS.SHA256, { sortPairs: true });
}

/**
 * Gets the Merkle Root for a list of hashes.
 */
export function getMerkleRoot(hashes: string[]): string {
  const tree = createMerkleTree(hashes);
  return tree.getRoot().toString("hex");
}

/**
 * Gets the Merkle Proof for a specific hash within a list.
 */
export function getMerkleProof(hashes: string[], targetHash: string): string[] {
  const tree = createMerkleTree(hashes);
  return tree.getProof(targetHash).map((p) => p.data.toString("hex"));
}
