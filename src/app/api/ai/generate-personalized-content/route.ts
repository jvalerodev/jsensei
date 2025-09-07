import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ContentGeneratorService } from "@/lib/ai/content-generator-service";
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
      difficulty_level: z.string(),
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

    // Generar contenido personalizado basado en la prueba de nivelación
    const result = await ContentGeneratorService.generatePersonalizedContent(
      placementData
    );

    console.log("🔄 Resultado de la generación de contenido:");
    console.log(JSON.stringify(result));

    // Guardar el análisis y plan de aprendizaje en la base de datos
    const { error: analysisError } = await supabase
      .from("placement_analysis")
      .insert({
        user_id: user.id,
        skill_level: result.analysis.skillLevel,
        weak_areas: result.analysis.weakAreas,
        strong_areas: result.analysis.strongAreas,
        recommended_topics: result.analysis.recommendedTopics,
        personalized_advice: result.analysis.personalizedAdvice,
        created_at: new Date().toISOString()
      });

    if (analysisError) {
      console.error("Error saving placement analysis:", analysisError);
    }

    // Guardar el plan de aprendizaje
    const { error: pathError } = await supabase.from("learning_paths").insert({
      user_id: user.id,
      path_id: result.learningPath.id,
      title: result.learningPath.title,
      description: result.learningPath.description,
      topics: result.learningPath.topics,
      estimated_duration: result.learningPath.estimatedDuration,
      created_at: new Date().toISOString()
    });

    if (pathError) {
      console.error("Error saving learning path:", pathError);
    }

    // Guardar el contenido inicial generado
    for (const content of result.initialContent) {
      const { error: contentError } = await supabase
        .from("generated_content")
        .insert({
          user_id: user.id,
          topic: content.title,
          skill_level: result.analysis.skillLevel,
          content: content,
          created_at: new Date().toISOString()
        });

      if (contentError) {
        console.error("Error saving initial content:", contentError);
      }
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      learningPath: result.learningPath,
      initialContent: result.initialContent
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
