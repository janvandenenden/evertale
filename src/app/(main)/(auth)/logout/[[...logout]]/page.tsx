import { SignOutButton } from "@clerk/nextjs";

export default function LogoutPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Sign Out</h1>
      <SignOutButton redirectUrl="/" />
    </main>
  );
}
