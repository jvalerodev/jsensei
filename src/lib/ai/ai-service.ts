import { generateObject } from "ai";
import { ollama } from "ollama-ai-provider-v2";
import {
  PlacementAnalysisSchema,
  LearningPathSchema,
  type PlacementAnalysis,
  type LearningPath,
  type PlacementTestData
} from "./schemas";
import { randomUUID } from "node:crypto";

/**
 * Servicio simplificado de IA para JSensei
 * Se enfoca únicamente en análisis de pruebas de nivelación y generación de planes de aprendizaje concisos
 */
export class AIService {
  // Modelo local configurado
  private static readonly DEFAULT_MODEL = "codellama:7b";

  /**
   * Analiza los resultados de la prueba de nivelación y genera recomendaciones
   */
  static async analyzePlacementTest(
    data: PlacementTestData
  ): Promise<PlacementAnalysis> {
    try {
      const prompt = this.buildPlacementAnalysisPrompt(data);

      const result = await generateObject({
        model: ollama(this.DEFAULT_MODEL),
        schema: PlacementAnalysisSchema,
        prompt,
        temperature: 0.8
      });

      return result.object;
    } catch (error) {
      console.error("Error analyzing placement test:", error);
      throw new Error("Error al analizar la prueba de nivelación");
    }
  }

  /**
   * Genera un plan de aprendizaje conciso y personalizado
   */
  static async generateLearningPath(
    analysis: PlacementAnalysis
  ): Promise<LearningPath> {
    try {
      const prompt = this.buildLearningPathPrompt(analysis);

      console.log("🤖 Generando plan de aprendizaje conciso con IA...");
      console.log("📊 Análisis:", analysis);

      const result = await generateObject({
        model: ollama(this.DEFAULT_MODEL),
        schema: LearningPathSchema,
        prompt,
        temperature: 0.7
      });

      console.log("✅ Plan de aprendizaje conciso generado exitosamente");
      return { id: randomUUID(), ...result.object };
    } catch (error) {
      console.error("❌ Error generating learning path:", error);
      throw new Error("Error al generar el plan de aprendizaje");
    }
  }

  // Métodos privados para construir prompts

  private static buildPlacementAnalysisPrompt(data: PlacementTestData): string {
    const { responses, questions } = data;

    const questionAnalysis = responses.map((response, index) => {
      const question = questions.find((q) => q.id === response.questionId);
      return {
        question: question?.question || "Pregunta no encontrada",
        topic: question?.topic || "Desconocido",
        difficulty: question?.difficulty_level || "beginner",
        userAnswer: response.selectedAnswer,
        correct: response.isCorrect,
        responseTime: response.responseTime
      };
    });

    return `Analiza los resultados de esta prueba de nivelación de JavaScript y proporciona un análisis detallado:

RESPUESTAS DEL ESTUDIANTE:
${JSON.stringify(questionAnalysis, null, 2)}

INSTRUCCIONES:
1. Determina el nivel de habilidad actual (beginner, intermediate, advanced)
2. Identifica áreas débiles que necesitan refuerzo
3. Identifica áreas fuertes del estudiante
4. Recomienda temas específicos para estudiar
5. Proporciona consejos personalizados para el aprendizaje

Considera:
- Patrones en las respuestas incorrectas
- Tiempo de respuesta (muy rápido puede indicar adivinanza, muy lento puede indicar dificultad)
- Temas donde falló consistentemente
- Nivel de dificultad de las preguntas respondidas correctamente

Genera un análisis que sea útil para crear un plan de aprendizaje personalizado.

FORMATO DE RESPUESTA (JSON):
{
  "skillLevel": "beginner" o "intermediate",
  "weakAreas": ["area1", "area2", ...],
  "strongAreas": ["area1", "area2", ...],
  "recommendedTopics": ["topic1", "topic2", ...],
  "personalizedAdvice": "consejo personalizado"
}

Responde SOLO con el JSON válido, sin texto adicional.`;
  }

  private static buildLearningPathPrompt(analysis: PlacementAnalysis): string {
    return `Eres un tutor experto de JavaScript. Genera un plan de aprendizaje CONCISO y personalizado.

ANÁLISIS DEL ESTUDIANTE:
- Nivel: ${analysis.skillLevel}
- Áreas débiles: ${analysis.weakAreas.join(", ")}
- Áreas fuertes: ${analysis.strongAreas.join(", ")}
- Temas recomendados: ${analysis.recommendedTopics.join(", ")}
- Consejo personalizado: ${analysis.personalizedAdvice}

INSTRUCCIONES:
1. Genera un plan con 4-6 módulos de JavaScript
2. Prioriza las áreas débiles identificadas
3. Para cada módulo incluye SOLO:
   - Título del módulo
   - Objetivo específico del módulo (1-2 líneas)
   - Lista de tópicos que se cubrirán (3-5 tópicos por módulo)
4. NO incluyas contenido detallado, ejemplos de código, ni ejercicios
5. Mantén la información concisa para evitar sobrecargar el modelo
6. Ordena los módulos de forma lógica y progresiva

FORMATO DE RESPUESTA (JSON):
{
  "title": "Plan de Aprendizaje JavaScript - [Nivel]",
  "description": "Descripción breve del plan personalizado",
  "topics": [
    {
      "title": "Nombre del Módulo",
      "objective": "Objetivo específico que logrará el estudiante",
      "topics": ["Tópico 1", "Tópico 2", "Tópico 3"]
    }
  ],
  "estimatedDuration": número total estimado en horas
}

Responde SOLO con el JSON válido, sin texto adicional.`;
  }
}
