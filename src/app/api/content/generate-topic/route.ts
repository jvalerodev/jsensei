import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { TopicContentService } from "@/lib/services/topic-content-service";
import { z } from "zod";
import { LearningPathService, UserService } from "@/lib/services";

// Schema for request validation
const GenerateTopicContentSchema = z.object({
  learningPathId: z.string().min(1, "Learning path ID es requerido"),
  topicId: z.string().min(1, "Topic ID es requerido")
});

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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = GenerateTopicContentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos de entrada inválidos",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { learningPathId, topicId } = validationResult.data;

    // Get learning path
    const learningPath = await LearningPathService.findById(learningPathId);

    if (!learningPath) {
      return NextResponse.json(
        { error: "Learning path no encontrado" },
        { status: 404 }
      );
    }

    // Get the specific topic by ID
    const topic = TopicContentService.getTopicById(learningPath, topicId);
    if (!topic) {
      return NextResponse.json(
        { error: "Topic no encontrado en el learning path" },
        { status: 404 }
      );
    }

    // Get user's skill level
    const profile = await UserService.getById(user.id);
    const userSkillLevel = profile?.skill_level || "beginner";

    // Get or generate topic content
    const result = await TopicContentService.getOrGenerateTopicContent(
      user.id,
      learningPathId,
      topicId,
      topic,
      userSkillLevel
    );

    return NextResponse.json({
      success: true,
      data: {
        content: result.content,
        wasGenerated: result.wasGenerated,
        topic: {
          id: topicId,
          title: topic.title,
          objective: topic.objective,
          topics: topic.topics
        },
        learningPath: {
          id: learningPath.id,
          title: learningPath.title,
          description: learningPath.description
        }
      }
    });
  } catch (error) {
    console.error("Error in generate-topic endpoint:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Recurso no encontrado" },
          { status: 404 }
        );
      }

      if (error.message.includes("validation")) {
        return NextResponse.json(
          { error: "Error de validación", details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message:
          process.env.NODE_ENV === "development" ? error?.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if content exists for a topic
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const learningPathId = searchParams.get("learningPathId");
    const topicId = searchParams.get("topicId");

    if (!learningPathId || !topicId) {
      return NextResponse.json(
        { error: "learningPathId y topicId son requeridos" },
        { status: 400 }
      );
    }

    // Check if content exists
    const hasContent = await TopicContentService.hasTopicContent(topicId);

    // Get existing content if it exists
    let content = null;
    if (hasContent) {
      content = await TopicContentService.getTopicContent(topicId);
    }

    return NextResponse.json({
      success: true,
      data: {
        hasContent,
        content: content || [],
        topicId,
        learningPathId
      }
    });
  } catch (error) {
    console.error("Error checking topic content:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message:
          process.env.NODE_ENV === "development" ? error?.toString() : undefined
      },
      { status: 500 }
    );
  }
}
