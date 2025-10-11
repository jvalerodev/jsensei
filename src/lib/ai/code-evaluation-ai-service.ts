import { generateObject } from "ai";
import { google } from "./google";
import { z } from "zod";

/**
 * Schema para la evaluación de código por IA
 */
const CodeEvaluationSchema = z.object({
  isPassing: z
    .boolean()
    .describe("Si el código cumple con los requisitos básicos del ejercicio"),
  score: z.number().min(0).max(100).describe("Puntuación del código (0-100)"),
  feedback: z
    .string()
    .describe(
      "Feedback detallado sobre el código: qué está bien y qué puede mejorar"
    ),
  suggestions: z
    .array(z.string())
    .describe("2-4 sugerencias específicas para mejorar el código"),
  correctnessAnalysis: z
    .string()
    .describe(
      "Análisis de si el código funciona correctamente y cumple los requisitos"
    ),
  codeQuality: z
    .string()
    .describe(
      "Análisis de la calidad del código: legibilidad, buenas prácticas, eficiencia"
    )
});

type CodeEvaluation = z.infer<typeof CodeEvaluationSchema>;

/**
 * Servicio de IA para evaluar código de ejercicios tipo "coding"
 * A diferencia de ejercicios con respuesta única, aquí la IA evalúa si el código es válido
 */
export class CodeEvaluationAIService {
  private static readonly DEFAULT_MODEL = "gemini-2.5-flash";

  /**
   * Evalúa código escrito por el usuario usando IA
   * La IA determina si el código cumple con los requisitos del ejercicio
   */
  static async evaluateCode(
    exerciseQuestion: string,
    userCode: string,
    attemptNumber: number,
    userSkillLevel: "beginner" | "intermediate" = "beginner",
    evaluationCriteria?: string
  ): Promise<CodeEvaluation> {
    try {
      const prompt = this.buildEvaluationPrompt(
        exerciseQuestion,
        userCode,
        attemptNumber,
        userSkillLevel,
        evaluationCriteria
      );

      console.log(
        `🤖 [CodeEvaluationAI] Evaluando código (Intento ${attemptNumber})...`
      );

      const result = await generateObject({
        model: google(this.DEFAULT_MODEL),
        schema: CodeEvaluationSchema,
        prompt,
        temperature: 0.3 // Temperatura baja para evaluaciones más consistentes
      });

      console.log(
        `✅ [CodeEvaluationAI] Código evaluado - Passing: ${result.object.isPassing}, Score: ${result.object.score}`
      );

      return result.object;
    } catch (error) {
      console.error("❌ [CodeEvaluationAI] Error evaluando código:", error);
      throw new Error("Error al evaluar el código con IA");
    }
  }

  /**
   * Construye el prompt para evaluar código
   */
  private static buildEvaluationPrompt(
    exerciseQuestion: string,
    userCode: string,
    attemptNumber: number,
    userSkillLevel: "beginner" | "intermediate",
    evaluationCriteria?: string
  ): string {
    const levelDescription =
      userSkillLevel === "beginner"
        ? "principiante (sé más permisivo con errores menores de estilo)"
        : "intermedio (espera mejor calidad de código y buenas prácticas)";

    const attemptContext =
      attemptNumber === 1
        ? "Este es el primer intento. Sé constructivo y alentador."
        : attemptNumber === 2
        ? "Este es el segundo intento. Proporciona feedback más específico."
        : "Este es el tercer y último intento. Evalúa con criterio pero mantén el feedback constructivo.";

    return `Eres un evaluador experto de código JavaScript. Tu tarea es evaluar si el código del estudiante cumple con los requisitos del ejercicio.

═══════════════════════════════════════════════════════════════════
📝 INFORMACIÓN DEL EJERCICIO
═══════════════════════════════════════════════════════════════════

**Nivel del estudiante:** ${levelDescription}

**Enunciado del ejercicio:**
${exerciseQuestion}

${
  evaluationCriteria
    ? `**Criterios de evaluación:**\n${evaluationCriteria}\n`
    : ""
}

**Código del estudiante:**
\`\`\`javascript
${userCode}
\`\`\`

═══════════════════════════════════════════════════════════════════
🎯 CONTEXTO DEL INTENTO
═══════════════════════════════════════════════════════════════════

${attemptContext}

Intento actual: ${attemptNumber}/3

═══════════════════════════════════════════════════════════════════
📋 INSTRUCCIONES PARA LA EVALUACIÓN
═══════════════════════════════════════════════════════════════════

**1. Determina si el código CUMPLE CON LOS REQUISITOS (isPassing):**
   - ✅ PASA si el código funciona correctamente y cumple el objetivo del ejercicio
   - ✅ PASA si hay errores menores de sintaxis pero la lógica es correcta
   - ✅ PASA si el código funciona aunque no sea perfecto en estilo
   - ❌ NO PASA si el código no resuelve el problema planteado
   - ❌ NO PASA si hay errores críticos de lógica
   - ❌ NO PASA si el código no se puede ejecutar

   **IMPORTANTE:** Para nivel principiante, sé más permisivo. El objetivo es que aprendan, no perfección.

**2. Asigna una puntuación (score: 0-100):**
   - 90-100: Excelente - Código correcto, bien estructurado, buenas prácticas
   - 70-89: Bien - Código funciona correctamente, puede mejorar en estilo/eficiencia
   - 50-69: Aceptable - Cumple requisitos básicos pero con problemas menores
   - 30-49: Incompleto - Lógica parcialmente correcta pero no funcional
   - 0-29: Incorrecto - No cumple los requisitos del ejercicio

**3. Proporciona feedback constructivo:**
   - Empieza reconociendo lo que está bien en el código
   - Explica claramente qué funciona y qué necesita mejorar
   - Usa un tono alentador y educativo
   - Sé específico sobre los problemas encontrados
   - Si el código pasa, felicita al estudiante

**4. Da sugerencias específicas (2-4 sugerencias):**
   - Enfócate en los problemas más importantes primero
   - Sugerencias deben ser accionables y claras
   - Si el código pasa, sugiere optimizaciones o mejoras de estilo
   - Si no pasa, sugiere cómo corregir los errores principales

**5. Analiza la corrección del código:**
   - ¿El código funciona como se espera?
   - ¿Cumple con todos los requisitos del ejercicio?
   - ¿Hay errores de lógica o sintaxis?

**6. Analiza la calidad del código:**
   - ¿Es legible y está bien estructurado?
   - ¿Usa buenas prácticas de JavaScript?
   - ¿Es eficiente?
   - ¿Tiene nombres de variables descriptivos?

═══════════════════════════════════════════════════════════════════
✅ CRITERIOS DE APROBACIÓN
═══════════════════════════════════════════════════════════════════

- Para aprobar (isPassing = true), el código DEBE cumplir con el objetivo del ejercicio
- La puntuación debe reflejar tanto la corrección como la calidad
- Sé justo pero constructivo en tu evaluación
- Recuerda el nivel del estudiante al evaluar

Genera la evaluación en el formato JSON especificado.`;
  }
}
