import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getDatabase } from "@/lib/database/server";
import type { LearningPath } from "@/lib/database/types";
import { PlacementTestService } from "@/lib/ai/placement-test-service";
import { z } from "zod";

// Esquema de validación para el request
const PersonalizedContentRequestSchema = z.object({
  responses: z.array(
    z.object({
      questionId: z.string(),
      selectedAnswer: z.string(),
      responseTime: z.number(),
      isCorrect: z.boolean()
    })
  ),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      correct_answer: z.string(),
      difficulty_level: z.enum(["beginner", "intermediate"]),
      topic: z.string(),
      points: z.number()
    })
  ),
  totalScore: z.number().optional(),
  maxScore: z.number().optional(),
  skillLevel: z.enum(["beginner", "intermediate"]).optional(),
  weakAreas: z.array(z.string()).optional(),
  strongAreas: z.array(z.string()).optional(),
  testDuration: z.number().optional()
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
    const validatedData = PersonalizedContentRequestSchema.parse(body);

    // Preparar datos para el análisis
    const placementData = {
      userId: user.id,
      responses: validatedData.responses,
      questions: validatedData.questions,
      totalScore: validatedData.totalScore || 0,
      maxScore: validatedData.maxScore || 0,
      skillLevel: validatedData.skillLevel || "beginner",
      weakAreas: validatedData.weakAreas || [],
      strongAreas: validatedData.strongAreas || [],
      testDuration: validatedData.testDuration || 0,
      completedAt: new Date().toISOString()
    };

    // Generar análisis y plan de aprendizaje con IA basado en la prueba de nivelación
    const result = await PlacementTestService.generateAnalysis(placementData);

    // Guardar el plan de aprendizaje con análisis integrado usando la nueva estructura
    const db = await getDatabase();
    let createdLearningPath: LearningPath;

    try {
      // Crear learning path con análisis integrado
      createdLearningPath = await db.learningPaths.create({
        user_id: user.id,
        title: result.learningPath.title,
        description: result.learningPath.description,
        skill_level: result.analysis.skillLevel,
        weak_areas: result.analysis.weakAreas,
        strong_areas: result.analysis.strongAreas,
        recommended_topics: result.analysis.recommendedTopics,
        topics: result.learningPath.topics, // La IA retorna la estructura correcta
        estimated_duration: result.learningPath.estimatedDuration
      });

      // Marcar el placement test como completado
      await db.users.update(user.id, {
        placement_test_completed: true,
        placement_test_score: validatedData.totalScore || 0,
        skill_level: result.analysis.skillLevel
      });
    } catch (dbError) {
      console.error("Error saving learning path and user data:", dbError);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      learningPath: {
        ...result.learningPath,
        id: createdLearningPath.id
      }
    });
  } catch (error) {
    console.error("Error generating personalized content:", error);

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
