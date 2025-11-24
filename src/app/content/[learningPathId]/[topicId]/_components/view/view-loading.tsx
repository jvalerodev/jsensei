import { Loader2 } from "lucide-react";

export function ViewLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 animate-pulse">Cargando contenido...</p>
        </div>
      </div>
    </div>
  );
}
