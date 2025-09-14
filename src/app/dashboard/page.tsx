import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createServerDatabase } from "@/lib/database/server";
import type { UserProgress } from "@/lib/database/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Target, Clock, Play } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get user profile using the database model
  const db = await createServerDatabase();
  const profile = await db.users.findById(user.id);

  // Check if user needs to take placement test
  if (!profile?.placement_test_completed) {
    redirect("/placement-test");
  }

  // Get user progress using the database model
  const progressResult = await db.userProgress.getUserProgress(user.id);
  const progress = progressResult.data;

  // Get lessons for the user's level using the database model
  const lessons = await db.lessons.findByDifficulty(profile.skill_level);

  // Get recent placement responses for activity using the database model
  const recentActivityResult = await db.placementResponses.findAll({ user_id: user.id }, { limit: 5, orderBy: 'created_at', orderDirection: 'desc' });
  const recentActivity = recentActivityResult.data;

  // Calculate overall progress
  const totalTopics = 12; // Total JavaScript topics
  const completedLessons =
    progress?.filter((p: UserProgress) => p.status === 'completed').length || 0;
  const overallProgress = Math.round((completedLessons / totalTopics) * 100);

  // Learning path based on user level
  const learningPath = getLearningPath(profile?.skill_level || "principiante");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ¡Bienvenido de vuelta, {profile?.display_name || user.email}!
          </h1>
          <p className="text-slate-600">
            Continúa tu viaje de aprendizaje en JavaScript - Nivel:{" "}
            {getLevelName(profile?.skill_level)}
          </p>
          {profile?.placement_test_score && (
            <div className="mt-2">
              <Badge variant="outline">
                Test de nivelación: {profile.placement_test_score} puntos
              </Badge>
            </div>
          )}
        </div>

        {/* Stats Overview */}
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
              <CardTitle className="text-sm font-medium">
                Racha Actual
              </CardTitle>
              <Trophy className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">7</div>
              <p className="text-xs text-slate-600 mt-1">días consecutivos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo Total
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">24h</div>
              <p className="text-xs text-slate-600 mt-1">tiempo estudiado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Path */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Tu Ruta de Aprendizaje
                </CardTitle>
                <CardDescription>
                  Basada en tu nivel:{" "}
                  {getLevelName(profile?.skill_level) || "Principiante"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPath.map((topic, index) => {
                    // For now, we'll use a simplified logic since we track lessons, not topics
                    // In a real implementation, you'd need to map topics to lessons
                    const isCompleted = index < completedLessons;
                    const isCurrent = index === completedLessons;
                    const isLocked = index > completedLessons;

                    return (
                      <div
                        key={topic.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isCurrent
                            ? "border-blue-200 bg-blue-50"
                            : isCompleted
                            ? "border-green-200 bg-green-50"
                            : isLocked
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCompleted
                                ? "bg-green-600 text-white"
                                : isCurrent
                                ? "bg-blue-600 text-white"
                                : "bg-slate-300 text-slate-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">
                              {topic.title}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {topic.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isCompleted && (
                            <Badge variant="secondary">Completado</Badge>
                          )}
                          {isCurrent && <Badge>Actual</Badge>}
                          {isLocked && (
                            <Badge variant="outline">Bloqueado</Badge>
                          )}
                          <Button
                            size="sm"
                            disabled={isLocked}
                            className={
                              isCurrent ? "bg-blue-600 hover:bg-blue-700" : ""
                            }
                          >
                            {isCurrent ? (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Continuar
                              </>
                            ) : isCompleted ? (
                              "Revisar"
                            ) : (
                              "Comenzar"
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
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
                  <BookOpen className="h-4 w-4 mr-2" />
                  Generar Contenido Personalizado
                </Button>
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
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.is_correct ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-slate-900">
                          {activity.is_correct ? "Completaste" : "Intentaste"}{" "}
                          un ejercicio
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
                    {getLevelName(profile?.skill_level)?.toUpperCase() ||
                      "PRINCIPIANTE"}
                  </Badge>
                  <p className="text-sm text-slate-600">
                    Continúa aprendiendo para subir de nivel
                  </p>
                  {profile?.placement_test_score && (
                    <div className="mt-2 text-xs text-slate-500">
                      Puntuación del test: {profile.placement_test_score}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getLevelName(level: string): string {
  const levelNames = {
    beginner: "Principiante",
    intermediate: "Intermedio"
  };
  return levelNames[level as keyof typeof levelNames] || "Principiante";
}

function getLearningPath(skillLevel: string) {
  const paths = {
    beginner: [
      {
        id: "variables",
        title: "Variables y Tipos de Datos",
        description: "Aprende a declarar y usar variables en JavaScript"
      },
      {
        id: "operators",
        title: "Operadores",
        description: "Operadores aritméticos, lógicos y de comparación"
      },
      {
        id: "conditionals",
        title: "Estructuras Condicionales",
        description: "if, else, switch y operador ternario"
      },
      {
        id: "loops",
        title: "Bucles",
        description: "for, while, do-while y métodos de array"
      },
      {
        id: "functions",
        title: "Funciones",
        description: "Declaración, expresiones y arrow functions"
      },
      {
        id: "arrays",
        title: "Arrays",
        description: "Manipulación y métodos de arrays"
      },
      {
        id: "objects",
        title: "Objetos",
        description: "Creación y manipulación de objetos"
      },
      {
        id: "dom",
        title: "DOM Básico",
        description: "Manipulación básica del DOM"
      },
      {
        id: "events",
        title: "Eventos",
        description: "Manejo de eventos del navegador"
      },
      {
        id: "async-basics",
        title: "Asincronía Básica",
        description: "setTimeout, setInterval y callbacks"
      },
      {
        id: "promises",
        title: "Promesas",
        description: "Promises y async/await"
      },
      {
        id: "modules",
        title: "Módulos",
        description: "Import/export y organización de código"
      }
    ],
    intermediate: [
      {
        id: "async-await",
        title: "Async/Await",
        description: "Maneja código asíncrono de forma elegante"
      },
      {
        id: "promises-advanced",
        title: "Promesas Avanzadas",
        description: "Promise.all, Promise.race y manejo de errores"
      },
      {
        id: "array-methods",
        title: "Métodos de Array Modernos",
        description: "map, filter, reduce y más"
      },
      {
        id: "destructuring-advanced",
        title: "Destructuring Avanzado",
        description: "Patrones complejos y casos de uso"
      },
      {
        id: "modules",
        title: "Módulos ES6",
        description: "Import/export y organización de código"
      },
      {
        id: "classes",
        title: "Clases y OOP",
        description: "Programación orientada a objetos en JS"
      }
    ]
  };

  return paths[skillLevel as keyof typeof paths] || paths.beginner;
}
