"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface ApiResponse {
  success?: boolean;
  message?: string;
  questionsCount?: number;
  error?: string;
}

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [questionsCount, setQuestionsCount] = useState<number | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/seed-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data: ApiResponse = await response.json();
      setResult(data);

      if (data.success && data.questionsCount) {
        setQuestionsCount(data.questionsCount);
      }
    } catch (error) {
      setResult({
        error: "Error connecting to server"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCheckDatabase = async () => {
    setIsChecking(true);

    try {
      const response = await fetch("/api/admin/seed-database", {
        method: "GET"
      });

      const data: ApiResponse = await response.json();
      setQuestionsCount(data.questionsCount || 0);
    } catch (error) {
      console.error("Error checking database:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            JSensei - Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona la base de datos del sistema de tutoría
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Database Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Estado de la Base de Datos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Preguntas del Test:
                </span>
                <Badge
                  variant={
                    questionsCount === null
                      ? "secondary"
                      : questionsCount > 0
                      ? "default"
                      : "destructive"
                  }
                >
                  {questionsCount === null
                    ? "No verificado"
                    : `${questionsCount} preguntas`}
                </Badge>
              </div>

              <Button
                onClick={handleCheckDatabase}
                disabled={isChecking}
                variant="outline"
                className="w-full"
              >
                {isChecking && (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                )}
                Verificar Estado
              </Button>
            </CardContent>
          </Card>

          {/* Database Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Base de Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p>Esta acción:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Eliminará las preguntas existentes</li>
                  <li>Insertará preguntas modernas de JavaScript</li>
                  <li>
                    Incluye preguntas de nivel principiante, intermedio y
                    avanzado
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSeeding && (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isSeeding
                  ? "Poblando Base de Datos..."
                  : "Poblar Base de Datos"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Resultado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert
                className={
                  result.success
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <AlertDescription
                  className={result.success ? "text-green-800" : "text-red-800"}
                >
                  {result.message || result.error}
                </AlertDescription>
              </Alert>

              {result.success && result.questionsCount && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Detalles de la operación:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      ✅ {result.questionsCount} preguntas insertadas
                      correctamente
                    </li>
                    <li>
                      ✅ Preguntas distribuidas en 3 niveles de dificultad
                    </li>
                    <li>✅ Contenido moderno de JavaScript (ES6+)</li>
                    <li>✅ Sistema listo para evaluación de usuarios</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <h4 className="font-semibold mb-2">
                Para configurar JSensei por primera vez:
              </h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Haz clic en "Verificar Estado" para ver el estado actual de la
                  base de datos
                </li>
                <li>
                  Haz clic en "Poblar Base de Datos" para insertar las preguntas
                  del test de nivelación
                </li>
                <li>
                  Una vez poblada, los usuarios podrán tomar el test de
                  nivelación
                </li>
                <li>
                  El sistema generará contenido personalizado basado en los
                  resultados
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Importante:
              </h4>
              <p className="text-sm text-yellow-700">
                La operación de poblar base de datos eliminará todas las
                preguntas existentes y las reemplazará con el conjunto
                actualizado. Esto también puede afectar los resultados de tests
                ya completados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

