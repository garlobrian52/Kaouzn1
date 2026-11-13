import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="wrap" style={{ display: "grid", placeItems: "center", minHeight: "80vh" }}>
      <SignIn />
    </main>
  );
}
