import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <Link
        href="/"
        className="mb-8 text-lg font-semibold tracking-tight text-foreground"
      >
        Persona<span className="text-brand">AI</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
