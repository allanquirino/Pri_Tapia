import { RefreshCw } from "lucide-react";

export default function LoadingOverlay({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
