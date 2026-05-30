"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Shield, Ban, ChevronDown, XCircle } from "lucide-react";

type Props = {
  userId: string;
};

export default function AdminUserActions({ userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);

  async function updateUser(data: Record<string, any>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.error || "Failed to update user"}`);
      }
    } catch (err) {
      alert("Network error: Could not reach the server.");
    } finally {
      setLoading(false);
      setShowPlanMenu(false);
    }
  }

  async function deleteUser() {
    if (!confirm("Are you sure? This is permanent.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
         alert("Delete operation failed on server.");
      }
    } catch (err) {
      alert("Network error during deletion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Account Status Control */}
      <div className="flex bg-black/40 rounded-lg border border-white/5 p-0.5 shadow-inner">
        <button
          onClick={() => updateUser({ approvalStatus: "APPROVED" })}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-all disabled:opacity-30"
          title="Approve Member"
        >
          <Shield className="h-4 w-4" />
        </button>
        <button
          onClick={() => updateUser({ approvalStatus: "BLOCKED" })}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500 transition-all disabled:opacity-30"
          title="Block Member"
        >
          <Ban className="h-4 w-4" />
        </button>
      </div>

      {/* Danger Zone */}
      <button
        onClick={deleteUser}
        disabled={loading}
        className="p-2 rounded-xl text-slate-700 hover:text-rose-500 hover:bg-rose-500/5 transition-all disabled:opacity-20"
        title="Destroy Identity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
