import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/get-session";
import CertificateEditor from "@/components/certificate-editor";

export default async function CertificatesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "MEMBER" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="h-screen">

      <CertificateEditor />
    </div>
  );
}
