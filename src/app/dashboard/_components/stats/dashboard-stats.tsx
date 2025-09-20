import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, BookOpen, Trophy, Clock } from "lucide-react";

type DashboardStatsProps = {
  overallProgress: number;
  completedLessons: number;
  totalTopics: number;
  currentStreak?: number;
  totalStudyTime?: string;
};

export function DashboardStats({
  overallProgress,
  completedLessons,
  totalTopics,
  currentStreak = 7,
  totalStudyTime = "24h"
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Progreso General
          </CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {overallProgress}%
          </div>
          <Progress value={overallProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Temas Completados
          </CardTitle>
          <BookOpen className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {completedLessons}/{totalTopics}
          </div>
          <p className="text-xs text-slate-600 mt-1">temas dominados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
          <Trophy className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {currentStreak}
          </div>
          <p className="text-xs text-slate-600 mt-1">días consecutivos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
          <Clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {totalStudyTime}
          </div>
          <p className="text-xs text-slate-600 mt-1">tiempo estudiado</p>
        </CardContent>
      </Card>
    </div>
  );
}
