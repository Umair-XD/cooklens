import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to get started
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
