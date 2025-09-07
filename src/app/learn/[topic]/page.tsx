"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  BookOpen,
  Code,
  CheckCircle,
  XCircle,
  Lightbulb,
  Play
} from "lucide-react";

interface GeneratedContent {
  title: string;
  content: string;
  exercises?: Exercise[];
  examples?: CodeExample[];
}

interface Exercise {
  id: string;
  question: string;
  type: "multiple-choice" | "code-completion" | "debugging";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface CodeExample {
  title: string;
  code: string;
  explanation: string;
}

export default function LearnTopicPage() {
  const params = useParams();
  const topic = params.topic as string;

  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<string, any>>(
    {}
  );
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    generateContent();
  }, [topic]);

  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          level: "principiante", // This should come from user profile
          type: "explanation"
        })
      });

      if (response.ok) {
        const generatedContent = await response.json();
        setContent(generatedContent);
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (exerciseId: string) => {
    const userAnswer = userAnswers[exerciseId];
    if (!userAnswer) return;

    const exercise = content?.exercises?.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    try {
      const response = await fetch("/api/exercises/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          userAnswer,
          correctAnswer: exercise.correctAnswer
        })
      });

      if (response.ok) {
        const result = await response.json();
        setExerciseResults((prev) => ({ ...prev, [exerciseId]: result }));
        setShowResults((prev) => ({ ...prev, [exerciseId]: true }));
      }
    } catch (error) {
      console.error("Error evaluating exercise:", error);
    }
  };

  const topicTitles: Record<string, string> = {
    variables: "Variables y Tipos de Datos",
    functions: "Funciones en JavaScript",
    arrays: "Arrays y Métodos",
    objects: "Objetos y Propiedades",
    loops: "Bucles y Iteración",
    conditionals: "Estructuras Condicionales"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Generando contenido personalizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {topicTitles[topic] ||
                  topic.charAt(0).toUpperCase() + topic.slice(1)}
              </h1>
              <p className="text-slate-600">
                Contenido personalizado para tu nivel
              </p>
            </div>
          </div>
          <Badge variant="secondary">Nivel: Principiante</Badge>
        </div>

        {content && (
          <div className="space-y-8">
            {/* Main Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  {content.title}
                </CardTitle>
                <CardDescription>
                  Explicación detallada del concepto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {content.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            {content.examples && content.examples.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-600" />
                    Ejemplos de Código
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {content.examples.map((example, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-slate-50"
                      >
                        <h4 className="font-medium text-slate-900 mb-2">
                          {example.title}
                        </h4>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto mb-3">
                          <code>{example.code}</code>
                        </pre>
                        <p className="text-sm text-slate-600">
                          {example.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercises */}
            {content.exercises && content.exercises.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-blue-600" />
                    Ejercicios Prácticos
                  </CardTitle>
                  <CardDescription>Pon a prueba tu comprensión</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {content.exercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className="border rounded-lg p-6 bg-white"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-slate-900">
                            Ejercicio {index + 1}
                          </h4>
                          <Badge variant="outline">{exercise.type}</Badge>
                        </div>

                        <p className="text-slate-700 mb-4">
                          {exercise.question}
                        </p>

                        {exercise.type === "multiple-choice" &&
                          exercise.options && (
                            <RadioGroup
                              value={userAnswers[exercise.id] || ""}
                              onValueChange={(value) =>
                                setUserAnswers((prev) => ({
                                  ...prev,
                                  [exercise.id]: value
                                }))
                              }
                              className="mb-4"
                            >
                              {exercise.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={option}
                                    id={`${exercise.id}-${optionIndex}`}
                                  />
                                  <Label
                                    htmlFor={`${exercise.id}-${optionIndex}`}
                                    className="text-slate-700"
                                  >
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}

                        {exercise.type === "code-completion" && (
                          <Textarea
                            placeholder="Escribe tu código aquí..."
                            value={userAnswers[exercise.id] || ""}
                            onChange={(e) =>
                              setUserAnswers((prev) => ({
                                ...prev,
                                [exercise.id]: e.target.value
                              }))
                            }
                            className="mb-4 font-mono"
                            rows={4}
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleAnswerSubmit(exercise.id)}
                            disabled={
                              !userAnswers[exercise.id] ||
                              showResults[exercise.id]
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {showResults[exercise.id]
                              ? "Respondido"
                              : "Enviar Respuesta"}
                          </Button>

                          {showResults[exercise.id] &&
                            exerciseResults[exercise.id] && (
                              <div className="flex items-center gap-2">
                                {exerciseResults[exercise.id].isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    exerciseResults[exercise.id].isCorrect
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {exerciseResults[exercise.id].isCorrect
                                    ? "¡Correcto!"
                                    : "Incorrecto"}
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Feedback */}
                        {showResults[exercise.id] &&
                          exerciseResults[exercise.id] && (
                            <div className="mt-4 p-4 rounded-lg bg-slate-50 border-l-4 border-blue-500">
                              <p className="text-slate-700 mb-2">
                                {exerciseResults[exercise.id].feedback}
                              </p>
                              <p className="text-sm text-slate-600 font-medium">
                                Explicación:
                              </p>
                              <p className="text-sm text-slate-600">
                                {exercise.explanation}
                              </p>
                              {exerciseResults[exercise.id].suggestions && (
                                <div className="mt-2">
                                  <p className="text-sm text-slate-600 font-medium">
                                    Sugerencias:
                                  </p>
                                  <ul className="text-sm text-slate-600 list-disc list-inside">
                                    {exerciseResults[
                                      exercise.id
                                    ].suggestions.map(
                                      (suggestion: string, idx: number) => (
                                        <li key={idx}>{suggestion}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={generateContent}
                variant="outline"
                className="bg-white"
              >
                Generar Nuevo Contenido
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Continuar al Siguiente Tema
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
