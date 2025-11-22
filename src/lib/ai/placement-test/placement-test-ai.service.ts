import { generateObject } from "ai";
import { google } from "../google";
import {
  PlacementAnalysisSchema,
  LearningPathSchema,
  type PlacementAnalysis,
  type LearningPath,
  type PlacementTestData
} from "../schemas";

/**
 * Servicio simplificado de IA para JSensei
 * Se enfoca únicamente en análisis de pruebas de nivelación y generación de planes de aprendizaje concisos
 */
export class PlacementTestAIService {
  // Modelo local configurado
  private static readonly DEFAULT_MODEL = "gemini-2.5-flash";

  /**
   * Analiza los resultados de la prueba de nivelación y genera recomendaciones
   */
  static async analyzePlacementTest(
    data: PlacementTestData
  ): Promise<PlacementAnalysis> {
    try {
      const prompt = this.buildPlacementAnalysisPrompt(data);

      const result = await generateObject({
        model: google(this.DEFAULT_MODEL),
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

      const result = await generateObject({
        model: google(this.DEFAULT_MODEL),
        schema: LearningPathSchema,
        prompt,
        temperature: 0.7
      });

      console.log("✅ Plan de aprendizaje generado exitosamente");
      return result.object;
    } catch (error) {
      console.error("❌ Error generating learning path:", error);
      throw new Error("Error al generar el plan de aprendizaje");
    }
  }

  // Métodos privados para construir prompts

  private static buildPlacementAnalysisPrompt(data: PlacementTestData): string {
    const { responses, questions } = data;

    const questionAnalysis = responses.map((response) => {
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
1. Determina el nivel de habilidad actual (beginner, intermediate)
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
    const isBeginnerLevel = analysis.skillLevel === "beginner";

    return `Eres un tutor experto de JavaScript. Genera un plan de aprendizaje COMPLETO y personalizado que cubra TODOS los módulos necesarios para que el estudiante alcance el nivel ${
      analysis.skillLevel
    }.

ANÁLISIS DEL ESTUDIANTE:
- Nivel actual: ${analysis.skillLevel}
- Áreas débiles: ${analysis.weakAreas.join(", ")}
- Áreas fuertes: ${analysis.strongAreas.join(", ")}
- Temas recomendados: ${analysis.recommendedTopics.join(", ")}
- Consejo personalizado: ${analysis.personalizedAdvice}

INSTRUCCIONES CRÍTICAS:
${
  isBeginnerLevel
    ? `
1. Genera un plan COMPLETO con TODOS los módulos necesarios para aprender JavaScript desde CERO hasta nivel básico (12-15 módulos aproximadamente)
2. El plan debe cubrir EXHAUSTIVAMENTE:
   - Fundamentos de programación y JavaScript
   - Variables, tipos de datos y operadores
   - Estructuras de control (if/else, switch)
   - Bucles (for, while, do-while)
   - Funciones (declaración, expresión, arrow functions)
   - Arrays y métodos de arrays
   - Objetos y propiedades
   - Strings y métodos
   - DOM básico (selección y manipulación)
   - Eventos básicos
   - Debugging básico
   - Y cualquier otro tema fundamental para nivel básico
`
    : `
1. Genera un plan COMPLETO con TODOS los módulos necesarios para alcanzar nivel intermedio (15-20 módulos aproximadamente)
2. El plan debe cubrir EXHAUSTIVAMENTE:
   - Repaso de fundamentos (si necesario según áreas débiles)
   - Funciones avanzadas (closures, callbacks, IIFE)
   - Arrays avanzados (map, filter, reduce, etc.)
   - Objetos avanzados (prototipos, this, bind/call/apply)
   - Programación orientada a objetos
   - Clases y herencia
   - Asincronía (callbacks, promises, async/await)
   - Manejo de errores (try/catch)
   - Módulos e importación
   - DOM avanzado
   - Eventos avanzados (delegación, propagación)
   - Manipulación del DOM
   - Local Storage y Session Storage
   - Fetch API
   - Expresiones regulares
   - Y cualquier otro tema necesario para nivel intermedio
`
}
3. PRIORIZA las áreas débiles identificadas en los primeros módulos
4. Para cada módulo incluye:
   - Título descriptivo del módulo
   - Objetivo específico y claro (1-2 líneas)
   - Lista de 3-5 tópicos concretos que se cubrirán
5. NO incluyas contenido detallado, ejemplos de código, ni ejercicios (eso se genera después)
6. Ordena los módulos de forma LÓGICA Y PROGRESIVA, desde lo más básico hasta lo más avanzado
7. Asegúrate de NO OMITIR ningún tema fundamental del nivel correspondiente

FORMATO DE RESPUESTA (JSON):
{
  "title": "Plan de Aprendizaje JavaScript - ${
    isBeginnerLevel ? "Nivel Básico Completo" : "Nivel Intermedio Completo"
  }",
  "description": "Plan completo personalizado que cubre todos los temas necesarios para alcanzar nivel ${
    analysis.skillLevel
  }",
  "topics": [
    {
      "title": "Nombre del Módulo",
      "objective": "Objetivo específico que logrará el estudiante",
      "topics": ["Tópico 1", "Tópico 2", "Tópico 3", "Tópico 4", "Tópico 5"]
    }
  ],
  "estimatedDuration": número total estimado en horas (debe reflejar todos los módulos)
}

IMPORTANTE: Genera un plan EXHAUSTIVO y COMPLETO. NO limites la cantidad de módulos. El estudiante necesita TODO el contenido para dominar el nivel ${
      analysis.skillLevel
    }.

Responde SOLO con el JSON válido, sin texto adicional.`;
  }
}
