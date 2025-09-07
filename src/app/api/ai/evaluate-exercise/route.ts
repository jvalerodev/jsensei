import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ContentGeneratorService } from "@/lib/ai/content-generator-service";
import { z } from "zod";

// Esquema de validación para el request
const EvaluateExerciseRequestSchema = z.object({
  exerciseId: z.string().min(1, "El ID del ejercicio es requerido"),
  exercise: z.string().min(1, "El ejercicio es requerido"),
  userAnswer: z.string().min(1, "La respuesta del usuario es requerida"),
  correctAnswer: z.string().min(1, "La respuesta correcta es requerida"),
  explanation: z.string().min(1, "La explicación es requerida")
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Validar y parsear el body
    const body = await request.json();
    const validatedData = EvaluateExerciseRequestSchema.parse(body);

    // Evaluar la respuesta del ejercicio
    const evaluation = await ContentGeneratorService.evaluateExercise(
      validatedData.exerciseId,
      validatedData.exercise,
      validatedData.userAnswer,
      validatedData.correctAnswer,
      validatedData.explanation
    );

    // Guardar la evaluación en la base de datos
    const { error: insertError } = await supabase
      .from("exercise_evaluations")
      .insert({
        user_id: user.id,
        exercise_id: validatedData.exerciseId,
        user_answer: validatedData.userAnswer,
        is_correct: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions,
        detailed_explanation: evaluation.detailedExplanation,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Error saving exercise evaluation:", insertError);
      // No fallar la request si no se puede guardar
    }

    return NextResponse.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error("Error evaluating exercise:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
