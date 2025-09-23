"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createClientDatabase } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, Clock, CheckCircle } from "lucide-react";
import { PlacementTestData } from "@/lib/ai/schemas";

interface Question {
  id: string;
  question: string;
  options: any; // JSONB array de opciones
  correct_answer: string;
  explanation?: string;
  topic: string;
  difficulty_level: "beginner" | "intermediate";
  points: number;
  is_active: boolean;
  created_at: string;
}

interface TestResult {
  totalScore: number;
  maxScore: number;
  skillLevel: "beginner" | "intermediate";
  correctAnswers: number;
  totalQuestions: number;
}

export default function PlacementTestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      questionId: string;
      answer: string;
      isCorrect: boolean;
      responseTime: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [testStartTime, setTestStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadQuestionsAndUser();
  }, []);

  const loadQuestionsAndUser = async () => {
    try {
      // Get current user
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      setUser(currentUser);

      // Initialize database service
      const db = createClientDatabase();

      // Check if user already completed placement test
      const userProfile = await db.users.findById(currentUser.id);
      if (userProfile?.placement_test_completed) {
        router.push("/dashboard");
        return;
      }

      // Load active questions using the model
      const beginnerQuestions = await db.placementTests.getQuestionsByDifficulty("beginner", { limit: 6 });
      const intermediateQuestions = await db.placementTests.getQuestionsByDifficulty("intermediate", { limit: 6 });

      const selectedQuestions = [
        ...beginnerQuestions.data,
        ...intermediateQuestions.data
      ];

      setQuestions(selectedQuestions);
      setTestStartTime(Date.now());
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    const newAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
      responseTime
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setQuestionStartTime(Date.now());
    } else {
      // Test completed
      completeTest(updatedAnswers);
    }
  };

  const completeTest = async (answers: typeof userAnswers) => {
    setIsSubmitting(true);

    try {
      // Initialize database service
      const db = createClientDatabase();

      // Save responses to database first using the model
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        await db.userInteractions.create({
          user_id: user.id,
          placement_test_id: answer.questionId,
          interaction_type: 'placement_answer',
          user_answer: answer.answer,
          is_correct: answer.isCorrect,
          response_time: answer.responseTime
        });
      }

      // Use the placement service for evaluation and content generation
      const { placementService } = await import("@/lib/ai/placement-service");

      const placementResult = await placementService.evaluatePlacementTest(
        user.id,
        answers.map((answer) => ({
          questionId: answer.questionId,
          selectedAnswer: answer.answer,
          responseTime: answer.responseTime
        }))
      );

      // Create placement test data for AI content generation
      const placementData: PlacementTestData = {
        userId: user.id,
        responses: answers.map((answer) => ({
          questionId: answer.questionId,
          selectedAnswer: answer.answer,
          responseTime: answer.responseTime,
          isCorrect: answer.isCorrect
        })),
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          correct_answer: q.correct_answer,
          difficulty_level: q.difficulty_level,
          topic: q.topic,
          points: q.points
        })),
        totalScore: placementResult.totalScore,
        maxScore: placementResult.maxScore,
        skillLevel: placementResult.skillLevel,
        weakAreas: placementResult.weakAreas,
        strongAreas: placementResult.strongAreas,
        testDuration: Date.now() - testStartTime,
        completedAt: new Date().toISOString()
      };

      // Complete user placement and generate learning path with AI
      setIsGeneratingContent(true);
      const { success, learningPath, aiGeneratedContent } =
        await placementService.completeUserPlacement(
          user.id,
          placementResult,
          placementData
        );
      setIsGeneratingContent(false);

      if (!success) {
        throw new Error("Failed to complete placement test");
      }

      // Convert to UI format
      const result: TestResult = {
        totalScore: placementResult.totalScore,
        maxScore: placementResult.maxScore,
        skillLevel: placementResult.skillLevel,
        correctAnswers: placementResult.correctAnswers,
        totalQuestions: placementResult.totalQuestions
      };

      setTestResult(result);
      setTestCompleted(true);

      // Log success with AI content info
      if (aiGeneratedContent) {
        console.log(
          "🎉 Prueba completada exitosamente con contenido de IA generado"
        );
        console.log("📊 Plan de aprendizaje:", learningPath?.title);
        console.log("📚 Temas generados:", learningPath?.topics.length);
      } else {
        console.log("📚 Prueba completada con plan de aprendizaje tradicional");
      }
    } catch (error) {
      console.error("❌ Error completing test:", error);
      // Mostrar mensaje de error al usuario
      alert(
        "Hubo un error al completar la prueba. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
      setIsGeneratingContent(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Cargando test de ubicación...</p>
        </div>
      </div>
    );
  }

  if (isGeneratingContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <CardTitle className="text-2xl">
              Generando tu Plan de Aprendizaje
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Nuestra IA está analizando tus respuestas para crear contenido
              personalizado...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testCompleted && testResult) {
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test de Ubicación
          </h1>
          <p className="text-gray-600">Evalúa tu nivel actual de JavaScript</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>~15 minutos</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentQuestion?.difficulty_level === "beginner"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                />
                <span className="text-sm text-gray-500 capitalize">
                  {currentQuestion?.difficulty_level === "beginner"
                    ? "Principiante"
                    : "Intermedio"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {currentQuestion?.points}{" "}
                {currentQuestion?.points === 1 ? "punto" : "puntos"}
              </span>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion?.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={handleAnswerSelect}
            >
              <div className="space-y-3">
                {(Array.isArray(currentQuestion?.options) ? currentQuestion.options : []).map((option: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {userAnswers.length > 0 && (
              <span>
                Correctas hasta ahora:{" "}
                {userAnswers.filter((a) => a.isCorrect).length}/
                {userAnswers.length}
              </span>
            )}
          </div>
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer || isSubmitting || isGeneratingContent}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {isGeneratingContent
              ? "🤖 Generando contenido personalizado..."
              : isSubmitting
              ? "Procesando..."
              : currentQuestionIndex === questions.length - 1
              ? "Finalizar Test"
              : "Siguiente"}
          </Button>
        </div>
      </div>
    </div>
  );
}
