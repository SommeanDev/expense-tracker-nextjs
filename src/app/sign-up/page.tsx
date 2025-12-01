"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="card">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
