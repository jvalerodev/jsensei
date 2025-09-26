import { Card, CardContent } from "@/components/ui/card";

export function ViewEmpty() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-600 animate-pulse">Cargando contenido...</p>
        </CardContent>
      </Card>
    </div>
  );
}
