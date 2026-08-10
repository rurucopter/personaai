import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border p-12 text-center">
      <p className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-5xl font-black text-transparent">
        404
      </p>
      <p className="text-sm text-muted-foreground">Cette page n&apos;existe pas.</p>
      <Button render={<Link href="/dashboard" />} nativeButton={false}>
        Retour au tableau de bord
      </Button>
    </div>
  );
}
