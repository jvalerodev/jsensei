import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ExerciseInteractionService } from "@/lib/services/exercise-interaction-service";

// POST - Save exercise answer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentId, exerciseId, userAnswer, correctAnswer, isCorrect, exerciseType } = body;

    // Validation
    if (!contentId || !exerciseId || userAnswer === undefined || correctAnswer === undefined || isCorrect === undefined) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Save the interaction
    await ExerciseInteractionService.saveExerciseAnswer(
      user.id,
      contentId,
      exerciseId,
      userAnswer,
      correctAnswer,
      isCorrect,
      exerciseType || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: "Respuesta guardada exitosamente"
    });
  } catch (error) {
    console.error("[API] Error saving exercise answer:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al guardar respuesta"
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve exercise answers for content
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");
    const exerciseId = searchParams.get("exerciseId");

    if (!contentId || !exerciseId) {
      return NextResponse.json(
        { success: false, error: "contentId y exerciseId requeridos" },
        { status: 400 }
      );
    }

    // Get the answer for this specific content/exercise
    const answer = await ExerciseInteractionService.getExerciseAnswer(
      user.id,
      contentId,
      exerciseId
    );

    // Return in the format expected by the hook (with exerciseId as key)
    const data = answer
      ? {
          [exerciseId]: answer
        }
      : {};

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("[API] Error retrieving exercise answers:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al recuperar respuestas"
      },
      { status: 500 }
    );
  }
}
