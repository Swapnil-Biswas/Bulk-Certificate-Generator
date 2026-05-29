import { prisma } from "@/lib/prisma";

type VerifyPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Invalid verification link</h1>
      </div>
    );
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Invalid or used token</h1>
      </div>
    );
  }

  if (verificationToken.expires < new Date()) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Verification token expired</h1>
      </div>
    );
  }

  await prisma.user.update({
    where: {
      email: verificationToken.identifier,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  await prisma.verificationToken.delete({
    where: {
      token,
    },
  });

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold">Email verified successfully</h1>
      <p className="mt-4">Your account is now pending admin approval.</p>
    </div>
  );
}
