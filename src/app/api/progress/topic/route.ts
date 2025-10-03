import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { TopicProgressService } from "@/lib/services/topic-progress-service";
import { z } from "zod";

// Schema for progress creation request
const createProgressSchema = z.object({
  learningPathId: z.string().min(1, "Learning path ID is required"),
  topicId: z.string().min(1, "Topic ID is required")
});

/**
 * POST /api/progress/topic
 * Create or update progress record for a topic
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "No autenticado"
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createProgressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { learningPathId, topicId } = validationResult.data;

    console.log(
      `[POST /api/progress/topic] Creating progress for user ${user.id}, topic ${topicId}`
    );

    // Check if all exercises are completed
    const allCompleted = await TopicProgressService.areAllExercisesCompleted({
      userId: user.id,
      topicId
    });

    if (!allCompleted) {
      return NextResponse.json(
        {
          success: false,
          error: "No todos los ejercicios están completados"
        },
        { status: 400 }
      );
    }

    // Create or update progress
    const progress = await TopicProgressService.createTopicProgress({
      userId: user.id,
      learningPathId,
      topicId
    });

    console.log(
      `[POST /api/progress/topic] Progress created successfully for topic ${topicId}`
    );

    return NextResponse.json({
      success: true,
      data: progress,
      message: "Progreso guardado exitosamente"
    });
  } catch (error) {
    console.error("[POST /api/progress/topic] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error al guardar el progreso";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/progress/topic
 * Get progress for a specific topic
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "No autenticado"
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const learningPathId = searchParams.get("learningPathId");
    const topicId = searchParams.get("topicId");

    if (!learningPathId || !topicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Learning path ID y topic ID son requeridos"
        },
        { status: 400 }
      );
    }

    // Get progress
    const progress = await TopicProgressService.getTopicProgress({
      userId: user.id,
      learningPathId,
      topicId
    });

    // Check if all exercises are completed
    const allCompleted = await TopicProgressService.areAllExercisesCompleted({
      userId: user.id,
      topicId
    });

    return NextResponse.json({
      success: true,
      data: progress,
      allExercisesCompleted: allCompleted
    });
  } catch (error) {
    console.error("[GET /api/progress/topic] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error al obtener el progreso";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
