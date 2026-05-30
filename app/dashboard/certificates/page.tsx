import { redirect } from "next/navigation";
import { Suspense } from "react";

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
      <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-muted-foreground font-bold">Initializing Studio...</div>}>
        <CertificateEditor />
      </Suspense>
    </div>
  );
}
