"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Brain, Clock, CheckCircle } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: string
  difficulty_level: string
  points: number
  explanation: string
}

interface TestResult {
  totalScore: number
  maxScore: number
  skillLevel: "beginner" | "intermediate" | "advanced"
  correctAnswers: number
  totalQuestions: number
}

export default function PlacementTestPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [userAnswers, setUserAnswers] = useState<
    Array<{ questionId: string; answer: string; isCorrect: boolean; responseTime: number }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testStartTime, setTestStartTime] = useState<number>(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadQuestionsAndUser()
  }, [])

  const loadQuestionsAndUser = async () => {
    try {
      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }
      setUser(currentUser)

      // Check if user already completed placement test
      const { data: profile } = await supabase
        .from("profiles")
        .select("placement_test_completed")
        .eq("id", currentUser.id)
        .single()

      if (profile?.placement_test_completed) {
        router.push("/dashboard")
        return
      }

      // Load questions (mix of all difficulty levels)
      const { data: questionsData, error } = await supabase
        .from("placement_questions")
        .select("*")
        .order("difficulty_level", { ascending: true })

      if (error) throw error

      // Select a balanced mix of questions (5 beginner, 4 intermediate, 3 advanced)
      const beginnerQuestions = questionsData.filter((q) => q.difficulty_level === "beginner").slice(0, 5)
      const intermediateQuestions = questionsData.filter((q) => q.difficulty_level === "intermediate").slice(0, 4)
      const advancedQuestions = questionsData.filter((q) => q.difficulty_level === "advanced").slice(0, 3)

      const selectedQuestions = [...beginnerQuestions, ...intermediateQuestions, ...advancedQuestions]

      setQuestions(selectedQuestions)
      setTestStartTime(Date.now())
      setQuestionStartTime(Date.now())
    } catch (error) {
      console.error("Error loading questions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    if (!selectedAnswer) return

    const currentQuestion = questions[currentQuestionIndex]
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000)
    const isCorrect = selectedAnswer === currentQuestion.correct_answer

    const newAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
      responseTime,
    }

    const updatedAnswers = [...userAnswers, newAnswer]
    setUserAnswers(updatedAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
      setQuestionStartTime(Date.now())
    } else {
      // Test completed
      completeTest(updatedAnswers)
    }
  }

  const completeTest = async (answers: typeof userAnswers) => {
    setIsSubmitting(true)

    try {
      // Calculate results
      const correctAnswers = answers.filter((a) => a.isCorrect).length
      const totalScore = answers.reduce((sum, answer, index) => {
        return sum + (answer.isCorrect ? questions[index].points : 0)
      }, 0)
      const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
      const percentage = (totalScore / maxScore) * 100

      // Determine skill level
      let skillLevel: "beginner" | "intermediate" | "advanced" = "beginner"
      if (percentage >= 70) skillLevel = "advanced"
      else if (percentage >= 40) skillLevel = "intermediate"

      const result: TestResult = {
        totalScore,
        maxScore,
        skillLevel,
        correctAnswers,
        totalQuestions: questions.length,
      }

      // Save responses to database
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i]
        await supabase.from("placement_responses").insert({
          user_id: user.id,
          question_id: answer.questionId,
          selected_answer: answer.answer,
          is_correct: answer.isCorrect,
          response_time: answer.responseTime,
        })
      }

      // Update user profile
      await supabase
        .from("profiles")
        .update({
          placement_test_completed: true,
          placement_test_score: totalScore,
          skill_level: skillLevel,
        })
        .eq("id", user.id)

      setTestResult(result)
      setTestCompleted(true)
    } catch (error) {
      console.error("Error completing test:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Cargando test de ubicación...</p>
        </div>
      </div>
    )
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
              <h3 className="font-semibold text-lg mb-4">Tu Nivel Determinado:</h3>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full ${
                    testResult.skillLevel === "beginner"
                      ? "bg-green-500"
                      : testResult.skillLevel === "intermediate"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="font-medium capitalize">
                  {testResult.skillLevel === "beginner"
                    ? "Principiante"
                    : testResult.skillLevel === "intermediate"
                      ? "Intermedio"
                      : "Avanzado"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Puntuación: {testResult.totalScore}/{testResult.maxScore} puntos
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Basándose en tus resultados, hemos personalizado tu plan de aprendizaje. ¡Comienza tu viaje de
                aprendizaje ahora!
              </p>
            </div>

            <Button onClick={handleGoToDashboard} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test de Ubicación</h1>
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
                      : currentQuestion?.difficulty_level === "intermediate"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-500 capitalize">
                  {currentQuestion?.difficulty_level === "beginner"
                    ? "Principiante"
                    : currentQuestion?.difficulty_level === "intermediate"
                      ? "Intermedio"
                      : "Avanzado"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {currentQuestion?.points} {currentQuestion?.points === 1 ? "punto" : "puntos"}
              </span>
            </div>
            <CardTitle className="text-xl leading-relaxed">{currentQuestion?.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
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
                Correctas hasta ahora: {userAnswers.filter((a) => a.isCorrect).length}/{userAnswers.length}
              </span>
            )}
          </div>
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {isSubmitting
              ? "Procesando..."
              : currentQuestionIndex === questions.length - 1
                ? "Finalizar Test"
                : "Siguiente"}
          </Button>
        </div>
      </div>
    </div>
  )
}
