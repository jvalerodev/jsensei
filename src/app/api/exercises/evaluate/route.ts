import { type NextRequest, NextResponse } from "next/server"
import { evaluateExercise } from "@/lib/ai/content-generator"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseId, userAnswer, correctAnswer } = body

    if (!exerciseId || !userAnswer || !correctAnswer) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    const evaluation = await evaluateExercise(exerciseId, userAnswer, correctAnswer)

    // Store user response and evaluation
    const { error: insertError } = await supabase.from("user_responses").insert({
      user_id: user.id,
      exercise_id: exerciseId,
      user_answer: userAnswer,
      is_correct: evaluation.isCorrect,
      feedback: evaluation.feedback,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error storing response:", insertError)
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error("Error evaluating exercise:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
