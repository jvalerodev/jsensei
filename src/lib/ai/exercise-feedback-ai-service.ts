import { generateObject } from "ai";
import { google } from "./google";
import { z } from "zod";

/**
 * Schema para el feedback de ejercicios
 */
const ExerciseFeedbackSchema = z.object({
  feedback: z.string().describe("Feedback constructivo sobre por qué la respuesta es incorrecta, sin revelar la respuesta correcta"),
  hints: z.array(z.string()).describe("2-3 pistas para ayudar al estudiante a encontrar la respuesta correcta"),
  relatedConcepts: z.array(z.string()).describe("Conceptos relacionados que el estudiante debe repasar")
});

type ExerciseFeedback = z.infer<typeof ExerciseFeedbackSchema>;

/**
 * Servicio de IA para generar feedback personalizado de ejercicios
 */
export class ExerciseFeedbackAIService {
  private static readonly DEFAULT_MODEL = "gemini-2.5-flash";

  /**
   * Genera feedback personalizado para una respuesta incorrecta
   */
  static async generateFeedback(
    exerciseQuestion: string,
    exerciseType: string,
    userAnswer: string,
    correctAnswer: string,
    attemptNumber: number,
    userSkillLevel: "beginner" | "intermediate" = "beginner"
  ): Promise<ExerciseFeedback> {
    try {
      const prompt = this.buildFeedbackPrompt(
        exerciseQuestion,
        exerciseType,
        userAnswer,
        correctAnswer,
        attemptNumber,
        userSkillLevel
      );

      console.log(
        `🤖 Generando feedback para ejercicio (Intento ${attemptNumber})...`
      );

      const result = await generateObject({
        model: google(this.DEFAULT_MODEL),
        schema: ExerciseFeedbackSchema,
        prompt,
        temperature: 0.7
      });

      console.log(`✅ Feedback generado exitosamente`);
      return result.object;
    } catch (error) {
      console.error("❌ Error generando feedback:", error);
      throw new Error("Error al generar feedback personalizado");
    }
  }

  /**
   * Construye el prompt para generar feedback personalizado
   */
  private static buildFeedbackPrompt(
    exerciseQuestion: string,
    exerciseType: string,
    userAnswer: string,
    correctAnswer: string,
    attemptNumber: number,
    userSkillLevel: "beginner" | "intermediate"
  ): string {
    const levelDescription =
      userSkillLevel === "beginner"
        ? "principiante (explicaciones simples y paso a paso)"
        : "intermedio (explicaciones más técnicas pero claras)";

    const attemptContext =
      attemptNumber === 1
        ? "Este es el primer intento del estudiante. Proporciona pistas sutiles que lo guíen sin dar demasiada información."
        : `Este es el intento ${attemptNumber} del estudiante. Proporciona pistas más directas pero aún sin revelar la respuesta completa.`;

    return `Eres un tutor experto y paciente de JavaScript. Un estudiante de nivel ${levelDescription} ha respondido incorrectamente a un ejercicio.

═══════════════════════════════════════════════════════════════════
📝 INFORMACIÓN DEL EJERCICIO
═══════════════════════════════════════════════════════════════════

**Tipo de ejercicio:** ${exerciseType}

**Pregunta:**
${exerciseQuestion}

**Respuesta del estudiante:**
${userAnswer}

**Respuesta correcta (NO REVELAR):**
${correctAnswer}

═══════════════════════════════════════════════════════════════════
🎯 CONTEXTO DEL INTENTO
═══════════════════════════════════════════════════════════════════

${attemptContext}

El estudiante tiene un máximo de 3 intentos. Después del tercer intento, se le mostrará la respuesta correcta.

═══════════════════════════════════════════════════════════════════
📋 INSTRUCCIONES PARA GENERAR FEEDBACK
═══════════════════════════════════════════════════════════════════

1. **Feedback constructivo:**
   - Analiza específicamente qué está mal en la respuesta del estudiante
   - Explica el concepto que el estudiante no está entendiendo
   - Mantén un tono alentador y positivo
   - NO reveles la respuesta correcta directamente
   - Enfócate en el proceso de pensamiento correcto

2. **Pistas (hints):**
   - Proporciona 2-3 pistas progresivas
   - La primera pista debe ser más general
   - Las siguientes pistas deben ser más específicas
   - Las pistas deben guiar al estudiante hacia la respuesta correcta
   - Usa analogías o ejemplos cuando sea apropiado

3. **Conceptos relacionados:**
   - Lista 2-4 conceptos de JavaScript que el estudiante debe repasar
   - Estos conceptos deben estar directamente relacionados con el error
   - Ordénalos por importancia

═══════════════════════════════════════════════════════════════════
✅ FORMATO DE RESPUESTA
═══════════════════════════════════════════════════════════════════

Genera el feedback en el formato JSON especificado con:
- feedback: Un párrafo constructivo (2-4 oraciones)
- hints: Array de 2-3 pistas progresivas
- relatedConcepts: Array de 2-4 conceptos para repasar

Recuerda: El objetivo es ayudar al estudiante a aprender, no solo darle la respuesta.`;
  }
}
