import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";
import { hashData, getMerkleRoot, getMerkleProof } from "@/lib/utils/crypto";
import { anchorRootOnChain } from "@/lib/blockchain/polygon";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, count, templateName, format, rows } = body;

    // Use a transaction to ensure atomicity
    const batch = await prisma.$transaction(async (tx) => {
      const newBatch = await tx.certificateBatch.create({
        data: {
          name,
          count: count || (rows ? rows.length : 0),
          templateName,
          format: format || "PNG",
          status: "Processing",
          userId: session.user.id,
        },
      });

      if (rows && rows.length > 0) {
        // 1. Pre-generate IDs and Hashes to avoid unique constraint issues
        const certDataWithIds = rows.map((row: any) => {
          const id = `cert_${crypto.randomBytes(4).toString("hex")}_${Date.now().toString(36)}`;
          const hash = hashData(id + JSON.stringify(row));
          return { id, hash, metadata: row };
        });

        const hashes = certDataWithIds.map((c: any) => c.hash);
        const merkleRoot = getMerkleRoot(hashes);

        // 2. Create certificates with their proofs
        const createdCerts = [];
        for (const item of certDataWithIds) {
          const proof = getMerkleProof(hashes, item.hash);
          const cert = await tx.certificate.create({
            data: {
              id: item.id,
              batchId: newBatch.id,
              metadata: item.metadata,
              hash: item.hash,
              merkleProof: proof,
            }
          });
          createdCerts.push(cert);
        }

        // 3. Update batch with Merkle Root and set as Completed
        return await tx.certificateBatch.update({
          where: { id: newBatch.id },
          data: {
            merkleRoot,
            status: "Completed",
          },
          include: {
            certificates: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
              }
            }
          }
        });
      }

      return await tx.certificateBatch.update({
        where: { id: newBatch.id },
        data: { status: "Completed" }
      });
    });

    // Start background anchoring if Merkle Root exists
    if (batch.merkleRoot) {
      anchorRootOnChain(batch.merkleRoot, batch.id).then(async (txHash) => {
        if (txHash) {
          await prisma.certificateBatch.update({
            where: { id: batch.id },
            data: { transactionHash: txHash }
          });
        }
      });
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error("[HISTORY_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
