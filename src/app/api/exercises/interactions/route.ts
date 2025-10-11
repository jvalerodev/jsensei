import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ExerciseInteractionService } from "@/lib/services/exercise-interaction-service";
import { getDatabase } from "@/lib/database/server";

// POST - Save exercise answer with AI feedback
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
    const { 
      contentId, 
      exerciseId, 
      userAnswer, 
      correctAnswer, 
      isCorrect, 
      exerciseType,
      exerciseQuestion,
      evaluationCriteria 
    } = body;

    // Validation - for coding exercises, correctAnswer and isCorrect are not required
    const isCodingExercise = exerciseType === "coding";
    
    if (!contentId || !exerciseId || userAnswer === undefined) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }
    
    if (!isCodingExercise && (correctAnswer === undefined || isCorrect === undefined)) {
      return NextResponse.json(
        { success: false, error: "correctAnswer e isCorrect son requeridos para ejercicios no-coding" },
        { status: 400 }
      );
    }

    // Get user skill level for personalized feedback
    const db = await getDatabase();
    const userData = await db.users.findById(user.id);
    const userSkillLevel = userData?.skill_level || "beginner";

    // Save the interaction with AI feedback
    // For coding exercises, AI will evaluate and determine isCorrect
    const result = await ExerciseInteractionService.saveExerciseAnswer(
      user.id,
      contentId,
      exerciseId,
      userAnswer,
      correctAnswer || "", // Empty string for coding exercises
      isCorrect || false, // Will be overridden by AI for coding exercises
      exerciseType || 'unknown',
      exerciseQuestion,
      userSkillLevel,
      evaluationCriteria // Evaluation criteria for coding exercises
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No se puede registrar más intentos",
          maxAttemptsReached: result.maxAttemptsReached,
          attemptNumber: result.attemptNumber
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Respuesta guardada exitosamente",
      attemptNumber: result.attemptNumber,
      maxAttemptsReached: result.maxAttemptsReached,
      aiFeedback: result.aiFeedback,
      aiSuggestions: result.aiSuggestions,
      relatedConcepts: result.relatedConcepts,
      isCorrect: result.isCorrect, // AI-evaluated correctness for coding exercises
      score: result.score // Score for coding exercises
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
