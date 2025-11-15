"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createClientDatabase } from "@/lib/database";
import { Brain } from "lucide-react";
import { PlacementTestData } from "@/lib/ai/schemas";
import {
  GeneratingContent,
  Navigation,
  ProgressInfo,
  QuestionCard,
  ResponseView
} from "./_components";
import type { Question, TestResult, UserAnswer } from "./types";

export default function PlacementTestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
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
        router.replace("/dashboard");
        return;
      }

      // Load active questions using the model
      const beginnerQuestions =
        await db.placementTests.getQuestionsByDifficulty("beginner", {
          limit: 6
        });
      const intermediateQuestions =
        await db.placementTests.getQuestionsByDifficulty("intermediate", {
          limit: 6
        });

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
          interaction_type: "placement_answer",
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

  const handleGoToDashboard = async () => {
    // Esperar un momento para asegurar que la actualización se propagó
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Usar replace para evitar que el usuario regrese al test
    router.replace("/dashboard");
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
    return <GeneratingContent />;
  }

  if (testCompleted && testResult) {
    return (
      <ResponseView
        testResult={testResult}
        handleGoToDashboard={handleGoToDashboard}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

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
        <ProgressInfo
          currentQuestionIndex={currentQuestionIndex}
          questions={questions}
        />

        {/* Question Card */}
        <QuestionCard
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          handleAnswerSelect={handleAnswerSelect}
        />

        {/* Navigation */}
        <Navigation
          currentQuestionIndex={currentQuestionIndex}
          questions={questions}
          userAnswers={userAnswers}
          selectedAnswer={selectedAnswer}
          isSubmitting={isSubmitting}
          isGeneratingContent={isGeneratingContent}
          handleNextQuestion={handleNextQuestion}
        />
      </div>
    </div>
  );
}
