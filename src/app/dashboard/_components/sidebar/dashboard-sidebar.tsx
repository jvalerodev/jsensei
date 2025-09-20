import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy } from "lucide-react";
import { getLevelName } from "../header";

type DashboardSidebarProps = {
  userId: string;
  userLevel?: string;
  placementScore?: number;
  recentActivity?: any[];
};

export function DashboardSidebar({
  userLevel,
  placementScore,
  recentActivity
}: DashboardSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full justify-start bg-transparent"
            variant="outline"
          >
            <Target className="h-4 w-4 mr-2" />
            Practicar Ejercicios
          </Button>
          <Button
            className="w-full justify-start bg-transparent"
            variant="outline"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Ver Logros
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity?.slice(0, 3).map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.is_correct ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-slate-900">
                    {activity.is_correct ? "Completaste" : "Intentaste"} un
                    ejercicio
                  </p>
                  <p className="text-slate-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-slate-500 text-sm">
                No hay actividad reciente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Level Badge */}
      <Card>
        <CardHeader>
          <CardTitle>Tu Nivel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
              {getLevelName(userLevel || "beginner")?.toUpperCase() ||
                "PRINCIPIANTE"}
            </Badge>
            <p className="text-sm text-slate-600">
              Continúa aprendiendo para subir de nivel
            </p>
            {placementScore && (
              <div className="mt-2 text-xs text-slate-500">
                Puntuación del test: {placementScore}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
