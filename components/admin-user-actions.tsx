"use client";

import { useRouter } from "next/navigation";

type Props = {
  userId: string;
};

export default function AdminUserActions({ userId }: Props) {
  const router = useRouter();

  async function updateUser(data: Record<string, string>) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    router.refresh();
  }

  async function deleteUser() {
    await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2 flex-wrap">
      <button
        onClick={() => updateUser({ approvalStatus: "APPROVED" })}
        className="rounded bg-green-600 px-3 py-2"
      >
        Approve
      </button>

      <button
        onClick={() => updateUser({ approvalStatus: "REJECTED" })}
        className="rounded bg-yellow-600 px-3 py-2"
      >
        Reject
      </button>

      <button
        onClick={() => updateUser({ approvalStatus: "BLOCKED" })}
        className="rounded bg-red-600 px-3 py-2"
      >
        Block
      </button>

      <button
        onClick={deleteUser}
        className="rounded bg-zinc-700 px-3 py-2"
      >
        Delete
      </button>
    </div>
  );
}
