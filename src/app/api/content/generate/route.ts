import { type NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai/content-generator";
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
    const { topic, level, type } = body;

    if (!topic || !level || !type) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const content = await generateContent({
      topic,
      level,
      type,
      userId: user.id
    });

    // Store generated content in database using the model
    const db = await getDatabase();

    try {
      await db.contents.create({
        user_id: user.id,
        title: content.title,
        content_type: type,
        skill_level: level,
        content: {
          title: content.title,
          content: content.content,
          exercises: content.exercises,
          examples: content.examples
        },
        is_generated_by_ai: true
      });
    } catch (insertError) {
      console.error("Error storing content:", insertError);
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
