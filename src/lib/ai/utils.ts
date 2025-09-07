import { ContentGeneratorService } from "./content-generator-service";
import {
  type GeneratedContent,
  type PlacementAnalysis,
  type LearningPath
} from "./schemas";

/**
 * Utilidades para facilitar el uso de los servicios de IA
 */
export class AIUtils {
  /**
   * Genera contenido educativo de forma simplificada
   */
  static async generateSimpleContent(
    topic: string,
    level: "beginner" | "intermediate"
  ): Promise<GeneratedContent> {
    return ContentGeneratorService.generateTopicContent(
      topic,
      level,
      [], // Sin áreas débiles específicas
      [], // Sin áreas fuertes específicas
      [topic] // Enfocar en el tema solicitado
    );
  }

  /**
   * Genera ejercicios de práctica rápida
   */
  static async generateQuickExercises(
    topic: string,
    level: "beginner" | "intermediate",
    count: number = 3
  ): Promise<GeneratedContent> {
    return ContentGeneratorService.generateReinforcementExercises(
      topic,
      level,
      [], // Sin áreas débiles específicas
      count
    );
  }

  /**
   * Obtiene una explicación adicional de un concepto
   */
  static async getConceptHelp(
    concept: string,
    level: "beginner" | "intermediate"
  ): Promise<string> {
    return ContentGeneratorService.generateConceptReinforcement(concept, level);
  }

  /**
   * Evalúa una respuesta de forma simplificada
   */
  static async quickEvaluate(
    exercise: string,
    userAnswer: string,
    correctAnswer: string
  ): Promise<{
    isCorrect: boolean;
    feedback: string;
    suggestions: string[];
  }> {
    const result = await ContentGeneratorService.evaluateExercise(
      "quick-eval",
      exercise,
      userAnswer,
      correctAnswer,
      "Evaluación rápida de ejercicio"
    );

    return {
      isCorrect: result.isCorrect,
      feedback: result.feedback,
      suggestions: result.suggestions
    };
  }

  /**
   * Genera un resumen de progreso del usuario
   */
  static async generateProgressSummary(
    userId: string,
    completedTopics: string[],
    scores: Record<string, number>
  ): Promise<{
    summary: string;
    recommendations: string[];
    nextSteps: string[];
  }> {
    const timeSpent: Record<string, number> = {}; // Mock data
    return ContentGeneratorService.generateProgressSummary(
      userId,
      completedTopics,
      scores,
      timeSpent
    );
  }
}

/**
 * Hook personalizado para usar los servicios de IA en componentes React
 */
export function useAIServices() {
  return {
    generateContent: AIUtils.generateSimpleContent,
    generateExercises: AIUtils.generateQuickExercises,
    getConceptHelp: AIUtils.getConceptHelp,
    evaluateAnswer: AIUtils.quickEvaluate,
    generateProgressSummary: AIUtils.generateProgressSummary
  };
}

/**
 * Valida que un contenido generado por IA sea válido
 */
export function validateGeneratedContent(
  content: any
): content is GeneratedContent {
  return (
    content &&
    typeof content.title === "string" &&
    typeof content.content === "string" &&
    content.title.length > 0 &&
    content.content.length > 0
  );
}

/**
 * Formatea el contenido generado para mostrar en la UI
 */
export function formatContentForDisplay(content: GeneratedContent): {
  title: string;
  content: string;
  examples: Array<{ title: string; code: string; explanation: string }>;
  exercises: Array<{
    id: string;
    question: string;
    type: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: string;
  }>;
} {
  return {
    title: content.title,
    content: content.content,
    examples: content.examples || [],
    exercises: content.exercises || []
  };
}

/**
 * Extrae palabras clave de un tema para búsqueda
 */
export function extractKeywords(topic: string): string[] {
  const commonWords = [
    "javascript",
    "js",
    "programming",
    "coding",
    "learn",
    "tutorial"
  ];
  const words = topic.toLowerCase().split(/\s+/);
  return words.filter((word) => word.length > 2 && !commonWords.includes(word));
}

/**
 * Calcula la dificultad promedio de un conjunto de ejercicios
 */
export function calculateAverageDifficulty(
  exercises: Array<{ difficulty: string }>
): number {
  const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
  const total = exercises.reduce(
    (sum, ex) =>
      sum + (difficultyMap[ex.difficulty as keyof typeof difficultyMap] || 1),
    0
  );
  return total / exercises.length;
}

/**
 * Genera un ID único para contenido
 */
export function generateContentId(prefix: string = "content"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
