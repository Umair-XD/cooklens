import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/AuthFormSkeleton";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-[14px] text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <Suspense fallback={<AuthFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
