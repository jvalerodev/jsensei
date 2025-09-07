import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ContentGeneratorService } from "@/lib/ai/content-generator-service";
import { z } from "zod";

// Esquema de validación para el request
const GenerateContentRequestSchema = z.object({
  topic: z.string().min(1, "El tema es requerido"),
  skillLevel: z.enum(["beginner", "intermediate"]),
  weakAreas: z.array(z.string()).optional().default([]),
  strongAreas: z.array(z.string()).optional().default([]),
  focusAreas: z.array(z.string()).optional().default([])
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
    const validatedData = GenerateContentRequestSchema.parse(body);

    // Generar contenido personalizado
    const content = await ContentGeneratorService.generateTopicContent(
      validatedData.topic,
      validatedData.skillLevel,
      validatedData.weakAreas,
      validatedData.strongAreas,
      validatedData.focusAreas
    );

    // Guardar el contenido generado en la base de datos
    const { error: insertError } = await supabase
      .from("generated_content")
      .insert({
        user_id: user.id,
        topic: validatedData.topic,
        skill_level: validatedData.skillLevel,
        content: content,
        weak_areas: validatedData.weakAreas,
        strong_areas: validatedData.strongAreas,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Error saving generated content:", insertError);
      // No fallar la request si no se puede guardar
    }

    return NextResponse.json({
      success: true,
      content
    });
  } catch (error) {
    console.error("Error generating content:", error);

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
