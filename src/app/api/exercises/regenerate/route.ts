import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getDatabase } from "@/lib/database/server";
import { ExerciseGeneratorAIService } from "@/lib/ai/exercise-generator-ai-service";
import { randomUUID } from "crypto";
import { z } from "zod";

const RegenerateExerciseSchema = z.object({
  contentId: z.string().uuid("ID de contenido inválido"),
  exerciseType: z.enum(["multiple-choice", "code-completion", "debugging", "coding"]),
  topicTitle: z.string().min(1, "Título del topic requerido"),
  topicContext: z.string().optional().default(""),
});

/**
 * POST - Regenera un ejercicio fallido con uno nuevo del mismo tipo
 * Elimina el ejercicio viejo de la BD y crea uno nuevo
 */
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

    // Validar datos de entrada
    const body = await request.json();
    const validationResult = RegenerateExerciseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Datos inválidos", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { contentId, exerciseType, topicTitle, topicContext } = validationResult.data;

    console.log(`[Regenerate Exercise] Iniciando regeneración para ejercicio contentId: ${contentId}`);

    // Obtener información del usuario para personalización
    const db = await getDatabase();
    const userData = await db.users.findById(user.id);
    const userSkillLevel = userData?.skill_level || "beginner";

    // Obtener el ejercicio actual (cada ejercicio es una fila en contents)
    const existingExercise = await db.contents.findById(contentId);
    
    if (!existingExercise) {
      return NextResponse.json(
        { success: false, error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }

    if (existingExercise.content_type !== "exercise") {
      return NextResponse.json(
        { success: false, error: "El contenido no es un ejercicio" },
        { status: 400 }
      );
    }

    // Extraer datos del ejercicio anterior para evitarlo
    const previousExerciseData = existingExercise.content as any;
    const previousExercise = {
      question: previousExerciseData.question || "",
      options: previousExerciseData.options || [],
      correctAnswer: previousExerciseData.correctAnswer || ""
    };

    // Generar nuevo ejercicio con IA, pasando el ejercicio anterior para que lo evite
    console.log(`[Regenerate Exercise] Generando nuevo ejercicio de tipo: ${exerciseType}`);
    console.log(`[Regenerate Exercise] Ejercicio anterior a evitar:`, previousExercise.question.substring(0, 100));
    
    const newExercise = await ExerciseGeneratorAIService.generateSingleExercise(
      topicTitle,
      topicContext,
      exerciseType,
      userSkillLevel,
      previousExercise
    );

    // Crear nuevo contenido del ejercicio manteniendo el mismo ID pero con datos nuevos
    const newExerciseContent = {
      id: randomUUID(), // Nuevo ID interno del ejercicio
      question: newExercise.question,
      type: newExercise.type,
      options: newExercise.options || [],
      correctAnswer: newExercise.correctAnswer,
      explanation: newExercise.explanation,
      difficulty: newExercise.difficulty
    };

    // Actualizar el registro de contents con el nuevo ejercicio
    console.log(`[Regenerate Exercise] Actualizando ejercicio en BD`);
    await db.contents.update(contentId, {
      description: newExercise.question.substring(0, 100),
      content: newExerciseContent
    });

    // Eliminar todas las interacciones del ejercicio (borramos todo el historial de ese contentId)
    console.log(`[Regenerate Exercise] Eliminando interacciones del ejercicio`);
    const { error: deleteError } = await supabase
      .from('user_interactions')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', contentId);

    if (deleteError) {
      console.warn(`[Regenerate Exercise] Advertencia al eliminar interacciones:`, deleteError);
      // No es crítico, continuamos
    }

    console.log(`[Regenerate Exercise] ✅ Ejercicio regenerado exitosamente`);

    return NextResponse.json({
      success: true,
      message: "Ejercicio regenerado exitosamente",
      newExercise: newExerciseContent
    });

  } catch (error) {
    console.error("[Regenerate Exercise] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al regenerar ejercicio"
      },
      { status: 500 }
    );
  }
}
