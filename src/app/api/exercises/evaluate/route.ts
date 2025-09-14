import { type NextRequest, NextResponse } from "next/server";
import { ContentGeneratorService } from "@/lib/ai/content-generator-service";
import { createServerClient } from "@/lib/supabase/server";
import { getDatabase } from "@/lib/database/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseId, userAnswer, correctAnswer, exercise, explanation } =
      body;

    if (!exerciseId || !userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Usar el nuevo servicio de IA para evaluar el ejercicio
    const evaluation = await ContentGeneratorService.evaluateExercise(
      exerciseId,
      exercise || "Ejercicio de JavaScript",
      userAnswer,
      correctAnswer,
      explanation || "Explicación del ejercicio"
    );

    // Store user response and evaluation using the database model
    const db = await getDatabase();
    
    try {
      await db.userResponses.create({
        user_id: user.id,
        exercise_id: exerciseId,
        user_answer: userAnswer,
        is_correct: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback
      });
    } catch (insertError) {
      console.error("Error storing response:", insertError);
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error evaluating exercise:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
