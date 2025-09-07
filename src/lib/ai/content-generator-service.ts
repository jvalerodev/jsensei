import { AIService } from "./ai-service";
import {
  type GeneratedContent,
  type PlacementAnalysis,
  type LearningPath,
  type PlacementTestData,
  type ContentGenerationRequest
} from "./schemas";

/**
 * Servicio especializado para generar contenido educativo personalizado
 * Basado en los resultados de la prueba de nivelación
 */
export class ContentGeneratorService {
  /**
   * Genera contenido personalizado basado en los resultados de la prueba de nivelación
   */
  static async generatePersonalizedContent(
    placementData: PlacementTestData
  ): Promise<{
    analysis: PlacementAnalysis;
    learningPath: LearningPath;
    initialContent: GeneratedContent[];
  }> {
    try {
      // 1. Analizar los resultados de la prueba de nivelación
      const analysis = await AIService.analyzePlacementTest(placementData);

      // 2. Generar plan de aprendizaje personalizado
      const learningPath = await AIService.generateLearningPath(
        analysis,
        placementData.userId
      );

      // 3. Generar contenido inicial para los primeros temas
      const initialContent = await this.generateInitialContent(
        learningPath,
        analysis
      );

      return {
        analysis,
        learningPath,
        initialContent
      };
    } catch (error) {
      console.error("Error generating personalized content:", error);
      throw new Error("Error al generar contenido personalizado");
    }
  }

  /**
   * Genera contenido específico para un tema basado en el rendimiento del usuario
   */
  static async generateTopicContent(
    topic: string,
    skillLevel: "beginner" | "intermediate",
    weakAreas: string[],
    strongAreas: string[],
    focusAreas?: string[]
  ): Promise<GeneratedContent> {
    try {
      const request: ContentGenerationRequest = {
        topic,
        skillLevel: skillLevel as "beginner" | "intermediate",
        weakAreas,
        strongAreas,
        focusAreas
      };

      return await AIService.generateEducationalContent(request);
    } catch (error) {
      console.error("Error generating topic content:", error);
      throw new Error("Error al generar contenido del tema");
    }
  }

  /**
   * Genera ejercicios específicos para reforzar áreas débiles
   */
  static async generateReinforcementExercises(
    topic: string,
    skillLevel: string,
    weakAreas: string[],
    count: number = 5
  ): Promise<GeneratedContent> {
    try {
      return await AIService.generateTargetedExercises(
        topic,
        skillLevel as "beginner" | "intermediate",
        weakAreas,
        count
      );
    } catch (error) {
      console.error("Error generating reinforcement exercises:", error);
      throw new Error("Error al generar ejercicios de refuerzo");
    }
  }

  /**
   * Genera contenido adaptativo basado en el progreso del usuario
   */
  static async generateAdaptiveContent(
    topic: string,
    currentLevel: string,
    performanceHistory: {
      recentScores: number[];
      timeSpent: number;
      strugglingAreas: string[];
      masteredAreas: string[];
    }
  ): Promise<GeneratedContent> {
    try {
      // Determinar el nivel de dificultad basado en el rendimiento
      const avgScore =
        performanceHistory.recentScores.reduce((a, b) => a + b, 0) /
        performanceHistory.recentScores.length;
      const difficultyLevel = this.calculateDifficultyLevel(
        avgScore,
        performanceHistory.timeSpent
      );

      const request: ContentGenerationRequest = {
        topic,
        skillLevel: difficultyLevel,
        weakAreas: performanceHistory.strugglingAreas,
        strongAreas: performanceHistory.masteredAreas,
        focusAreas: performanceHistory.strugglingAreas
      };

      return await AIService.generateEducationalContent(request);
    } catch (error) {
      console.error("Error generating adaptive content:", error);
      throw new Error("Error al generar contenido adaptativo");
    }
  }

  /**
   * Genera explicaciones adicionales para conceptos difíciles
   */
  static async generateConceptReinforcement(
    concept: string,
    skillLevel: string,
    previousAttempts: string[] = []
  ): Promise<string> {
    try {
      return await AIService.generateConceptExplanation(
        concept,
        skillLevel as "beginner" | "intermediate",
        previousAttempts
      );
    } catch (error) {
      console.error("Error generating concept reinforcement:", error);
      throw new Error("Error al generar refuerzo del concepto");
    }
  }

  /**
   * Evalúa una respuesta de ejercicio y proporciona retroalimentación detallada
   */
  static async evaluateExercise(
    exerciseId: string,
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
      return await AIService.evaluateExerciseResponse(
        exercise,
        userAnswer,
        correctAnswer,
        explanation
      );
    } catch (error) {
      console.error("Error evaluating exercise:", error);
      throw new Error("Error al evaluar el ejercicio");
    }
  }

  // Métodos privados auxiliares

  /**
   * Genera contenido inicial para los primeros temas del plan de aprendizaje
   */
  private static async generateInitialContent(
    learningPath: LearningPath,
    analysis: PlacementAnalysis
  ): Promise<GeneratedContent[]> {
    const initialTopics = learningPath.topics.slice(0, 3); // Primeros 3 temas
    const contentPromises = initialTopics.map((topic) =>
      this.generateTopicContent(
        topic.title,
        topic.difficulty,
        analysis.weakAreas,
        analysis.strongAreas,
        [topic.title] // Enfocar en este tema específico
      )
    );

    return Promise.all(contentPromises);
  }

  /**
   * Calcula el nivel de dificultad apropiado basado en el rendimiento
   */
  private static calculateDifficultyLevel(
    avgScore: number,
    timeSpent: number
  ): "beginner" | "intermediate" {
    // Lógica para determinar dificultad basada en rendimiento
    if (avgScore >= 70 && timeSpent < 600) {
      // 10 minutos
      return "intermediate";
    } else {
      return "beginner";
    }
  }

  /**
   * Mapea temas de JavaScript a niveles de dificultad
   */
  private static getTopicDifficulty(
    topic: string
  ): "beginner" | "intermediate" {
    const topicMap: Record<string, "beginner" | "intermediate"> = {
      // Temas básicos
      variables: "beginner",
      functions: "beginner",
      arrays: "beginner",
      objects: "beginner",
      loops: "beginner",
      conditionals: "beginner",

      // Temas intermedios
      "async-await": "intermediate",
      promises: "intermediate",
      "array-methods": "intermediate",
      "es6-modules": "intermediate",
      destructuring: "intermediate",
      "template-literals": "intermediate",

      // Temas intermedios avanzados
      closures: "intermediate",
      prototypes: "intermediate",
      generators: "intermediate",
      proxies: "intermediate",
      reflection: "intermediate"
    };

    return topicMap[topic.toLowerCase()] || "beginner";
  }

  /**
   * Genera un resumen del progreso del usuario
   */
  static async generateProgressSummary(
    userId: string,
    completedTopics: string[],
    currentScores: Record<string, number>,
    timeSpent: Record<string, number>
  ): Promise<{
    summary: string;
    recommendations: string[];
    nextSteps: string[];
  }> {
    try {
      const prompt = `Genera un resumen del progreso de aprendizaje de JavaScript:

USUARIO: ${userId}
TEMAS COMPLETADOS: ${completedTopics.join(", ")}
PUNTUACIONES ACTUALES: ${JSON.stringify(currentScores)}
TIEMPO INVERTIDO: ${JSON.stringify(timeSpent)}

Genera:
1. Un resumen motivador del progreso
2. Recomendaciones específicas para mejorar
3. Próximos pasos sugeridos

FORMATO:
RESUMEN: [resumen del progreso]
RECOMENDACIONES: [lista de recomendaciones]
PRÓXIMOS PASOS: [lista de próximos pasos]

Sé motivador pero realista, y proporciona consejos específicos y accionables.`;

      const result = await AIService.generateConceptExplanation(
        "progreso del usuario",
        "intermediate",
        []
      );

      // Parse the response
      const lines = result.split("\n");
      const summary =
        lines
          .find((line: string) => line.startsWith("RESUMEN:"))
          ?.replace("RESUMEN:", "")
          .trim() || "";
      const recommendations =
        lines
          .find((line: string) => line.startsWith("RECOMENDACIONES:"))
          ?.replace("RECOMENDACIONES:", "")
          .split(",")
          .map((r: string) => r.trim()) || [];
      const nextSteps =
        lines
          .find((line: string) => line.startsWith("PRÓXIMOS PASOS:"))
          ?.replace("PRÓXIMOS PASOS:", "")
          .split(",")
          .map((s: string) => s.trim()) || [];

      return {
        summary,
        recommendations,
        nextSteps
      };
    } catch (error) {
      console.error("Error generating progress summary:", error);
      throw new Error("Error al generar resumen de progreso");
    }
  }
}
