import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";
import { hashData, getMerkleRoot, getMerkleProof } from "@/lib/utils/crypto";
import { anchorRootOnChain } from "@/lib/blockchain/polygon";

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
        // 1. Create all certificates first to get their IDs
        const createdCerts = [];
        for (const row of rows) {
          const cert = await tx.certificate.create({
            data: {
              batchId: newBatch.id,
              metadata: row,
              hash: "",
              merkleProof: [],
            }
          });
          createdCerts.push(cert);
        }

        // 2. Generate hashes
        const hashes = createdCerts.map(cert => 
          hashData(cert.id + JSON.stringify(cert.metadata))
        );

        // 3. Calculate Merkle Root
        const merkleRoot = getMerkleRoot(hashes);

        // 4. Update each certificate
        for (let i = 0; i < createdCerts.length; i++) {
          const cert = createdCerts[i];
          const proof = getMerkleProof(hashes, hashes[i]);
          await tx.certificate.update({
            where: { id: cert.id },
            data: {
              hash: hashes[i],
              merkleProof: proof,
            },
          });
        }

        // 5. Update batch with Merkle Root and set as Completed
        return await tx.certificateBatch.update({
          where: { id: newBatch.id },
          data: {
            merkleRoot,
            status: "Completed",
          },
          include: {
            certificates: {
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
