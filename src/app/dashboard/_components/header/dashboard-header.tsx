import { Badge } from "@/components/ui/badge";

type DashboardHeaderProps = {
  userName: string;
  userLevel: string;
  placementScore?: number;
};

export function DashboardHeader({
  userName,
  userLevel,
  placementScore
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        ¡Bienvenido de vuelta, {userName}!
      </h1>
      <p className="text-slate-600">
        Continúa tu viaje de aprendizaje en JavaScript - Nivel: {userLevel}
      </p>
      {placementScore && (
        <div className="mt-2">
          <Badge variant="outline">
            Test de nivelación: {placementScore} puntos
          </Badge>
        </div>
      )}
    </div>
  );
}

export function getLevelName(level: string): string {
  const levelNames = {
    beginner: "Principiante",
    intermediate: "Intermedio"
  };
  return levelNames[level as keyof typeof levelNames] || "Principiante";
}
