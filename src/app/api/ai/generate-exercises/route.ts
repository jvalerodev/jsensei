import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ContentGeneratorService } from "@/lib/ai/content-generator-service";
import { z } from "zod";

// Esquema de validación para el request
const GenerateExercisesRequestSchema = z.object({
  topic: z.string().min(1, "El tema es requerido"),
  skillLevel: z.enum(["beginner", "intermediate"]),
  weakAreas: z.array(z.string()).optional().default([]),
  count: z.number().min(1).max(10).optional().default(5)
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
    const validatedData = GenerateExercisesRequestSchema.parse(body);

    // Generar ejercicios de refuerzo
    const exercises =
      await ContentGeneratorService.generateReinforcementExercises(
        validatedData.topic,
        validatedData.skillLevel,
        validatedData.weakAreas,
        validatedData.count
      );

    // Guardar los ejercicios generados
    const { error: insertError } = await supabase
      .from("generated_exercises")
      .insert({
        user_id: user.id,
        topic: validatedData.topic,
        skill_level: validatedData.skillLevel,
        weak_areas: validatedData.weakAreas,
        exercises: exercises,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Error saving generated exercises:", insertError);
      // No fallar la request si no se puede guardar
    }

    return NextResponse.json({
      success: true,
      exercises
    });
  } catch (error) {
    console.error("Error generating exercises:", error);

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
