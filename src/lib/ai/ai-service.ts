import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  GeneratedContentSchema,
  SimpleGeneratedContentSchema,
  PlacementAnalysisSchema,
  SimpleLearningPathSchema,
  LearningPathSchema,
  type GeneratedContent,
  type SimpleGeneratedContent,
  type PlacementAnalysis,
  type SimpleLearningPath,
  type LearningPath,
  type PlacementTestData,
  type ContentGenerationRequest
} from "./schemas";

const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

/**
 * Servicio principal de IA para JSensei
 * Maneja todas las interacciones con modelos de IA de forma modular
 */
export class AIService {
  private static readonly DEFAULT_MODEL = "gpt-5-nano";

  /**
   * Genera contenido educativo personalizado basado en el nivel y áreas débiles
   */
  static async generateEducationalContent(
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> {
    try {
      const prompt = this.buildContentPrompt(request);

      const result = await generateObject({
        model: openai(this.DEFAULT_MODEL),
        schema: SimpleGeneratedContentSchema,
        prompt,
        temperature: 0.8
      });

      // Convertir el esquema simplificado al formato completo agregando IDs
      return this.convertSimpleToFullGeneratedContent(result.object);
    } catch (error) {
      console.error("Error generating educational content:", error);
      throw new Error("Error al generar contenido educativo");
    }
  }

  /**
   * Analiza los resultados de la prueba de nivelación y genera recomendaciones
   */
  static async analyzePlacementTest(
    data: PlacementTestData
  ): Promise<PlacementAnalysis> {
    try {
      const prompt = this.buildPlacementAnalysisPrompt(data);

      const result = await generateObject({
        model: openai(this.DEFAULT_MODEL),
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
   * Genera un plan de aprendizaje personalizado
   */
  static async generateLearningPath(
    analysis: PlacementAnalysis,
    userId: string
  ): Promise<LearningPath> {
    try {
      const prompt = this.buildLearningPathPrompt(analysis);

      console.log("🤖 Generando plan de aprendizaje con IA...");
      console.log("📊 Análisis:", analysis);

      const result = await generateObject({
        model: openai(this.DEFAULT_MODEL),
        schema: SimpleLearningPathSchema,
        prompt,
        temperature: 0.9
      });

      console.log("✅ Plan de aprendizaje generado exitosamente");

      // Convertir el esquema simplificado al formato completo
      const convertedPath = this.convertSimpleToFullLearningPath(result.object);

      return convertedPath;
    } catch (error) {
      console.error("❌ Error generating learning path:", error);

      // Si es un error de esquema, intentar con un enfoque más simple
      if (error instanceof Error && error.message.includes("schema")) {
        console.log("🔄 Intentando con esquema más simple...");
        return this.generateFallbackLearningPath(analysis, userId);
      }

      throw new Error("Error al generar el plan de aprendizaje");
    }
  }

  /**
   * Genera ejercicios específicos para reforzar áreas débiles
   */
  static async generateTargetedExercises(
    topic: string,
    skillLevel: "beginner" | "intermediate",
    weakAreas: string[],
    count: number = 3
  ): Promise<GeneratedContent> {
    try {
      const prompt = this.buildExercisePrompt(
        topic,
        skillLevel,
        weakAreas,
        count
      );

      const result = await generateObject({
        model: openai(this.DEFAULT_MODEL),
        schema: SimpleGeneratedContentSchema,
        prompt,
        temperature: 0.8
      });

      // Convertir el esquema simplificado al formato completo agregando IDs
      return this.convertSimpleToFullGeneratedContent(result.object);
    } catch (error) {
      console.error("Error generating targeted exercises:", error);
      throw new Error("Error al generar ejercicios específicos");
    }
  }

  /**
   * Evalúa una respuesta de ejercicio y proporciona retroalimentación
   */
  static async evaluateExerciseResponse(
    exercise: string,
    userAnswer: string,
    correctAnswer: string,
    explanation: string
  ): Promise<{
    isCorrect: boolean;
    score: number;
    feedback: string;
    suggestions: string[];
    detailedExplanation: string;
  }> {
    try {
      const prompt = this.buildEvaluationPrompt(
        exercise,
        userAnswer,
        correctAnswer,
        explanation
      );

      const result = await generateText({
        model: openai(this.DEFAULT_MODEL),
        prompt,
        temperature: 0.8
      });

      // Parse the response to extract structured data
      const lines = result.text.split("\n");
      const isCorrect = lines[0]?.includes("CORRECTO") || false;
      const score = parseInt(lines[1]?.match(/\d+/)?.[0] || "0");
      const feedback = lines[2]?.replace("FEEDBACK:", "").trim() || "";
      const suggestions =
        lines[3]
          ?.replace("SUGERENCIAS:", "")
          .split(",")
          .map((s) => s.trim()) || [];
      const detailedExplanation = lines.slice(4).join("\n").trim();

      return {
        isCorrect,
        score,
        feedback,
        suggestions,
        detailedExplanation
      };
    } catch (error) {
      console.error("Error evaluating exercise response:", error);
      throw new Error("Error al evaluar la respuesta del ejercicio");
    }
  }

  /**
   * Genera explicaciones adicionales para conceptos difíciles
   */
  static async generateConceptExplanation(
    concept: string,
    skillLevel: "beginner" | "intermediate",
    previousAttempts: string[] = []
  ): Promise<string> {
    try {
      const prompt = this.buildConceptExplanationPrompt(
        concept,
        skillLevel,
        previousAttempts
      );

      const result = await generateText({
        model: openai(this.DEFAULT_MODEL),
        prompt,
        temperature: 0.8
      });

      return result.text;
    } catch (error) {
      console.error("Error generating concept explanation:", error);
      throw new Error("Error al generar explicación del concepto");
    }
  }

  // Métodos privados para construir prompts

  private static buildContentPrompt(request: ContentGenerationRequest): string {
    const { topic, skillLevel, weakAreas, strongAreas, focusAreas } = request;

    return `Eres un tutor experto de JavaScript. Genera contenido educativo personalizado con las siguientes especificaciones:

TEMA: ${topic}
NIVEL: ${skillLevel}
ÁREAS DÉBILES: ${weakAreas.join(", ")}
ÁREAS FUERTES: ${strongAreas.join(", ")}
${focusAreas ? `ÁREAS DE ENFOQUE: ${focusAreas.join(", ")}` : ""}

INSTRUCCIONES:
1. Crea contenido que refuerce las áreas débiles del estudiante
2. Aprovecha sus áreas fuertes para construir confianza
3. Incluye ejemplos prácticos y ejercicios progresivos
4. Usa un lenguaje apropiado para el nivel ${skillLevel}
5. Incluye explicaciones claras y detalladas
6. Genera ejercicios que permitan práctica inmediata

FORMATO REQUERIDO:
- Título descriptivo y atractivo
- Contenido estructurado con explicaciones claras
- Ejemplos de código bien comentados
- Ejercicios variados (múltiple opción, completar código, debugging)
- Dificultad apropiada para el nivel

Genera contenido que sea educativo, motivador y efectivo para el aprendizaje.`;
  }

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

Genera un análisis que sea útil para crear un plan de aprendizaje personalizado.`;
  }

  private static buildLearningPathPrompt(analysis: PlacementAnalysis): string {
    return `Genera un plan de aprendizaje personalizado de JavaScript. Responde EXACTAMENTE en el formato JSON especificado.

ANÁLISIS DEL ESTUDIANTE:
- Nivel: ${analysis.skillLevel}
- Áreas débiles: ${analysis.weakAreas.join(", ")}
- Áreas fuertes: ${analysis.strongAreas.join(", ")}
- Temas recomendados: ${analysis.recommendedTopics.join(", ")}
- Consejo personalizado: ${analysis.personalizedAdvice}

INSTRUCCIONES:
1. Genera un plan con 5-6 temas de JavaScript
2. Prioriza las áreas débiles identificadas
3. Cada tema debe tener: título, descripción, dificultad (beginner/intermediate), tiempo estimado
4. Incluye contenido educativo con ejemplos de código
5. Genera 2-3 ejercicios por tema
6. Ordena los temas de forma lógica

FORMATO DE RESPUESTA (JSON):
{
  "title": "Título del plan",
  "description": "Descripción general",
  "topics": [
    {
      "title": "Título del tema",
      "description": "Descripción del tema",
      "difficulty": "beginner" o "intermediate",
      "estimatedTime": número en minutos,
      "content": {
        "title": "Título del contenido",
        "content": "Explicación detallada del tema",
        "examples": [
          {
            "title": "Título del ejemplo",
            "code": "código JavaScript",
            "explanation": "Explicación del ejemplo"
          }
        ],
        "exercises": [
          {
            "question": "Pregunta del ejercicio",
            "type": "multiple-choice" o "code-completion" o "debugging" o "coding",
            "options": ["opción1", "opción2", "opción3"],
            "correctAnswer": "respuesta correcta",
            "explanation": "explicación de la respuesta",
            "difficulty": "beginner" o "intermediate"
          }
        ]
      }
    }
  ],
  "estimatedDuration": número total en minutos
}

Responde SOLO con el JSON válido, sin texto adicional.`;
  }

  private static buildExercisePrompt(
    topic: string,
    skillLevel: "beginner" | "intermediate",
    weakAreas: string[],
    count: number
  ): string {
    return `Genera ${count} ejercicios específicos de JavaScript para reforzar estas áreas débiles:

TEMA: ${topic}
NIVEL: ${skillLevel}
ÁREAS DÉBILES: ${weakAreas.join(", ")}

INSTRUCCIONES:
1. Crea ejercicios que aborden directamente las áreas débiles
2. Varía el tipo de ejercicio (múltiple opción, completar código, debugging)
3. Incluye explicaciones detalladas para cada respuesta
4. Asegúrate de que la dificultad sea apropiada para el nivel
5. Proporciona ejemplos de código claros y bien comentados

FORMATO:
- Título del ejercicio
- Pregunta clara y específica
- Opciones (si es múltiple opción)
- Respuesta correcta
- Explicación detallada
- Dificultad apropiada

Genera ejercicios que sean educativos, desafiantes pero alcanzables.`;
  }

  private static buildEvaluationPrompt(
    exercise: string,
    userAnswer: string,
    correctAnswer: string,
    explanation: string
  ): string {
    return `Evalúa esta respuesta de ejercicio de JavaScript:

EJERCICIO: ${exercise}
RESPUESTA DEL ESTUDIANTE: ${userAnswer}
RESPUESTA CORRECTA: ${correctAnswer}
EXPLICACIÓN: ${explanation}

FORMATO DE RESPUESTA:
CORRECTO/INCORRECTO
PUNTUACIÓN: [0-100]
FEEDBACK: [comentario breve y constructivo]
SUGERENCIAS: [lista separada por comas de sugerencias específicas]
EXPLICACIÓN DETALLADA: [explicación completa de por qué la respuesta es correcta o incorrecta, incluyendo conceptos clave]

Evalúa de forma constructiva y educativa, proporcionando retroalimentación útil para el aprendizaje.`;
  }

  private static buildConceptExplanationPrompt(
    concept: string,
    skillLevel: "beginner" | "intermediate",
    previousAttempts: string[]
  ): string {
    const attemptsText =
      previousAttempts.length > 0
        ? `\nINTENTOS PREVIOS: ${previousAttempts.join(", ")}`
        : "";

    return `Explica este concepto de JavaScript de manera clara y comprensible:

CONCEPTO: ${concept}
NIVEL: ${skillLevel}${attemptsText}

INSTRUCCIONES:
1. Usa un lenguaje apropiado para el nivel ${skillLevel}
2. Proporciona ejemplos prácticos y claros
3. Explica el "por qué" detrás del concepto
4. Incluye casos de uso comunes
5. Menciona errores comunes y cómo evitarlos
6. Si hay intentos previos, aborda las confusiones específicas

Genera una explicación que sea clara, motivadora y fácil de entender.`;
  }

  /**
   * Convierte un SimpleLearningPath a LearningPath completo agregando IDs
   */
  private static convertSimpleToFullLearningPath(
    simplePath: SimpleLearningPath
  ): LearningPath {
    return {
      id: randomUUID(),
      title: simplePath.title,
      description: simplePath.description,
      estimatedDuration: simplePath.estimatedDuration,
      topics: simplePath.topics.map((topic) => ({
        id: randomUUID(),
        title: topic.title,
        description: topic.description,
        difficulty: topic.difficulty,
        estimatedTime: topic.estimatedTime,
        content: {
          title: topic.content.title,
          content: topic.content.content,
          examples: topic.content.examples || [],
          exercises: (topic.content.exercises || []).map((exercise) => ({
            id: randomUUID(),
            question: exercise.question,
            type: exercise.type,
            options: exercise.options,
            correctAnswer: exercise.correctAnswer,
            explanation: exercise.explanation,
            difficulty: exercise.difficulty
          }))
        }
      }))
    };
  }

  /**
   * Convierte un SimpleGeneratedContent a GeneratedContent completo agregando IDs
   */
  private static convertSimpleToFullGeneratedContent(
    simpleContent: SimpleGeneratedContent
  ): GeneratedContent {
    return {
      title: simpleContent.title,
      content: simpleContent.content,
      examples: simpleContent.examples || [],
      exercises: (simpleContent.exercises || []).map((exercise) => ({
        id: randomUUID(),
        question: exercise.question,
        type: exercise.type,
        options: exercise.options,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
        difficulty: exercise.difficulty
      }))
    };
  }

  /**
   * Genera un plan de aprendizaje de fallback si la IA falla
   */
  private static generateFallbackLearningPath(
    analysis: PlacementAnalysis,
    userId: string
  ): LearningPath {
    console.log("📚 Generando plan de aprendizaje de fallback...");

    const topics = analysis.weakAreas.slice(0, 5).map((area, index) => ({
      id: `topic-${index + 1}`,
      title: this.getTopicTitle(area),
      description: `Aprende ${area} paso a paso`,
      difficulty: analysis.skillLevel,
      estimatedTime: 30,
      content: {
        title: `Introducción a ${area}`,
        content: `Este tema te ayudará a entender ${area} en JavaScript.`,
        examples: [],
        exercises: []
      }
    }));

    return {
      id: `path-${userId}-${Date.now()}`,
      title: `Plan de Aprendizaje - ${analysis.skillLevel}`,
      description: `Plan personalizado para reforzar tus áreas débiles: ${analysis.weakAreas.join(
        ", "
      )}`,
      topics,
      estimatedDuration: topics.reduce(
        (total, topic) => total + topic.estimatedTime,
        0
      )
    };
  }

  /**
   * Obtiene un título amigable para un tema
   */
  private static getTopicTitle(area: string): string {
    const topicMap: Record<string, string> = {
      variables: "Variables y Tipos de Datos",
      functions: "Funciones en JavaScript",
      arrays: "Arrays y Métodos",
      objects: "Objetos y Propiedades",
      "async-await": "Programación Asíncrona",
      promises: "Promesas",
      closures: "Closures y Scope",
      prototypes: "Prototipos",
      destructuring: "Destructuring",
      "template-literals": "Template Literals",
      "arrow-functions": "Arrow Functions",
      "array-methods": "Métodos de Array",
      "es6-modules": "Módulos ES6",
      "error-handling": "Manejo de Errores"
    };

    return topicMap[area] || area.charAt(0).toUpperCase() + area.slice(1);
  }
}
