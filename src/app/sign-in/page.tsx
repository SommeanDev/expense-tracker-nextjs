"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="card">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
