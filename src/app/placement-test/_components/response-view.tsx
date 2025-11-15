import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import type { TestResult } from "../types";

type ResponseViewProps = {
  testResult: TestResult;
  handleGoToDashboard: () => void;
};

export function ResponseView({
  testResult,
  handleGoToDashboard
}: ResponseViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Test Completado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {testResult.correctAnswers}/{testResult.totalQuestions}
            </div>
            <p className="text-gray-600">Respuestas correctas</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">
              Tu Nivel Determinado:
            </h3>
            <div className="flex items-center space-x-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  testResult.skillLevel === "beginner"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />
              <span className="font-medium capitalize">
                {testResult.skillLevel === "beginner"
                  ? "Principiante"
                  : "Intermedio"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Puntuación: {testResult.totalScore}/{testResult.maxScore} puntos
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Basándose en tus resultados, hemos personalizado tu plan de
              aprendizaje. ¡Comienza tu viaje de aprendizaje ahora!
            </p>
          </div>

          <Button
            onClick={handleGoToDashboard}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            Ir al Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
