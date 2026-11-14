"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Check,
  Loader2,
  MailCheck,
  MoreHorizontal,
  Send,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Undo2,
  X,
} from "lucide-react";

type Props = {
  user: {
    id: string;
    name: string;
    role: "ADMIN" | "MEMBER";
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
    emailVerified: boolean;
  };
  isSelf: boolean;
};

export default function AdminUserActions({ user, isSelf }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function request(method: "PATCH" | "DELETE", body: Record<string, string> | undefined, success: string) {
    setBusy(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setFeedback({ tone: "ok", text: success });
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: data.error || "That didn't work. Please try again." });
      }
    } catch {
      setFeedback({ tone: "error", text: "Couldn't reach the server." });
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  const patch = (body: Record<string, string>, success: string) => request("PATCH", body, success);
  const { approvalStatus: status, role } = user;

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">This is you</span>;
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center justify-end gap-1.5" role="group" aria-label={`Delete ${user.name}?`}>
        <span className="mr-1 hidden text-xs text-muted-foreground xl:inline">Delete account and all its data?</span>
        <button onClick={() => setConfirmDelete(false)} className="h-8 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted">
          Cancel
        </button>
        <button
          onClick={() => request("DELETE", undefined, "Account deleted.")}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-rose-500 px-2.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-3 w-3 animate-spin" />}
          Delete
        </button>
      </div>
    );
  }

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors";

  return (
    <div className="relative flex items-center justify-end gap-1.5">
      {feedback && (
        <span
          role="status"
          className={`absolute right-0 top-full z-20 mt-1 max-w-[260px] rounded-lg border bg-card px-2.5 py-1.5 text-xs shadow-lg ${
            feedback.tone === "ok" ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          {feedback.text}
        </span>
      )}

      {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

      {status === "PENDING" && (
        <>
          <button
            onClick={() => patch({ approvalStatus: "APPROVED" }, `${user.name} can now sign in.`)}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => patch({ approvalStatus: "REJECTED" }, "Request rejected.")}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </>
      )}

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={busy}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`More actions for ${user.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {open && (
          <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-60 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {(status === "REJECTED" || status === "BLOCKED") && (
              <button role="menuitem" className={item} onClick={() => patch({ approvalStatus: "APPROVED" }, `${user.name} can sign in again.`)}>
                <Undo2 className="h-4 w-4 text-muted-foreground" />
                {status === "BLOCKED" ? "Unblock and approve" : "Approve after all"}
              </button>
            )}
            {status === "APPROVED" && (
              <button role="menuitem" className={item} onClick={() => patch({ approvalStatus: "BLOCKED" }, `${user.name} is blocked.`)}>
                <Ban className="h-4 w-4 text-muted-foreground" />
                Block access
              </button>
            )}
            {!user.emailVerified && (
              <>
                <button role="menuitem" className={item} onClick={() => patch({ action: "verifyEmail" }, "Email marked as confirmed.")}>
                  <MailCheck className="h-4 w-4 text-muted-foreground" />
                  Mark email as confirmed
                </button>
                <button role="menuitem" className={item} onClick={() => patch({ action: "resendVerification" }, "Confirmation email sent.")}>
                  <Send className="h-4 w-4 text-muted-foreground" />
                  Resend confirmation email
                </button>
              </>
            )}
            {role === "MEMBER" ? (
              <button role="menuitem" className={item} onClick={() => patch({ role: "ADMIN", approvalStatus: "APPROVED" }, `${user.name} is now an administrator.`)}>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Make administrator
              </button>
            ) : (
              <button role="menuitem" className={item} onClick={() => patch({ role: "MEMBER" }, `${user.name} is now a member.`)}>
                <ShieldOff className="h-4 w-4 text-muted-foreground" />
                Remove administrator role
              </button>
            )}
            <div className="my-1 h-px bg-border" />
            <button
              role="menuitem"
              className={`${item} !text-rose-500 hover:!bg-rose-500/10`}
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete account…
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
