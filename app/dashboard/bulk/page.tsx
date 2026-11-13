import { redirect } from "next/navigation";

// Bulk generation lives in the editor's Data tab; keep old links working.
export default function BulkGeneratePage() {
  redirect("/dashboard/certificates");
}
