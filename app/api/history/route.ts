import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth/get-session";
import { hashData, createMerkleTree } from "@/lib/utils/crypto";
import { anchorRootOnChain } from "@/lib/blockchain/polygon";

const MAX_ROWS = 5000;
const CHUNK = 500;

function clean(value: unknown, fallback: string, max = 200): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}

export async function POST(req: Request) {
  try {
    const session = await getActiveSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const rows: Record<string, string>[] = Array.isArray(body.rows) ? body.rows : [];
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `A batch can contain up to ${MAX_ROWS.toLocaleString("en-US")} certificates. Split your list and export it in parts.` },
        { status: 413 }
      );
    }

    const templateName = clean(body.templateName, "Untitled template");
    const name = clean(body.name, templateName);
    const format = body.format === "PDF" ? "PDF" : "PNG";
    const count = rows.length || Math.max(1, Math.min(MAX_ROWS, Number(body.count) || 1));

    // Single export (no recipient list): just log it.
    if (rows.length === 0) {
      const batch = await prisma.certificateBatch.create({
        data: { name, count, templateName, format, status: "Completed", userId: session.user.id },
      });
      return NextResponse.json({ ...batch, certificates: [] });
    }

    // Fingerprint every certificate, then build the Merkle tree once for the whole batch.
    const stamp = Date.now().toString(36);
    const certs = rows.map((row) => {
      const id = `cert_${crypto.randomBytes(8).toString("hex")}_${stamp}`;
      return { id, metadata: row, hash: hashData(id + JSON.stringify(row)) };
    });
    const tree = createMerkleTree(certs.map((c) => c.hash));
    const merkleRoot = tree.getRoot().toString("hex");

    const batch = await prisma.$transaction(
      async (tx) => {
        const created = await tx.certificateBatch.create({
          data: { name, count, templateName, format, status: "Completed", merkleRoot, userId: session.user.id },
        });
        // Bulk inserts in chunks — one round-trip per 500 certificates instead of one each.
        for (let i = 0; i < certs.length; i += CHUNK) {
          await tx.certificate.createMany({
            data: certs.slice(i, i + CHUNK).map((c, j) => ({
              id: c.id,
              batchId: created.id,
              metadata: c.metadata,
              hash: c.hash,
              merkleProof: tree.getProof(c.hash, i + j).map((p) => p.data.toString("hex")),
            })),
          });
        }
        return created;
      },
      { maxWait: 10_000, timeout: 60_000 }
    );

    // Anchor in the background when on-chain credentials are configured.
    anchorRootOnChain(merkleRoot, batch.id)
      .then(async (txHash) => {
        if (txHash) {
          await prisma.certificateBatch.update({ where: { id: batch.id }, data: { transactionHash: txHash } });
        }
      })
      .catch((err) => console.error("[BLOCKCHAIN_ANCHOR_ERROR]", err));

    // Same order as the submitted rows, so the editor can pair each row with its certificate ID.
    return NextResponse.json({ ...batch, certificates: certs.map((c) => ({ id: c.id })) });
  } catch (error) {
    console.error("[HISTORY_POST_ERROR]", error);
    return NextResponse.json({ error: "Could not record this batch. Please try again." }, { status: 500 });
  }
}
