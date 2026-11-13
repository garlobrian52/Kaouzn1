import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="wrap" style={{ display: "grid", placeItems: "center", minHeight: "80vh" }}>
      <SignUp />
    </main>
  );
}
