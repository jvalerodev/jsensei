import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { getDatabase } from "@/lib/database/server";
import { PlacementTestService } from "@/lib/services";
import type { LearningPath } from "@/lib/database/types";

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

    // Calcular el score sumando los puntos de las respuestas correctas
    const totalScore = validatedData.responses.reduce((sum, response) => {
      if (response.isCorrect) {
        const question = validatedData.questions.find(
          (q) => q.id === response.questionId
        );
        return sum + (question?.points || 0);
      }
      return sum;
    }, 0);

    // Calcular el score máximo posible
    const maxScore = validatedData.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );

    // Preparar datos para el análisis
    const placementData = {
      userId: user.id,
      responses: validatedData.responses,
      questions: validatedData.questions,
      totalScore,
      maxScore,
      skillLevel: validatedData.skillLevel,
      weakAreas: validatedData.weakAreas,
      strongAreas: validatedData.strongAreas,
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
        placement_test_score: totalScore,
        skill_level: result.analysis.skillLevel
      });
    } catch (dbError) {
      console.error("Error saving learning path and user data:", dbError);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      totalScore,
      maxScore,
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
