import { type NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai/content-generator";
import { createServerClient } from "@/lib/supabase/server";

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

    // Store generated content in database
    const { error: insertError } = await supabase
      .from("generated_content")
      .insert({
        user_id: user.id,
        topic,
        level,
        type,
        title: content.title,
        content: content.content,
        metadata: {
          exercises: content.exercises,
          examples: content.examples
        }
      });

    if (insertError) {
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
