import { randomUUID } from "node:crypto";
import { AIService } from "./ai-service";
import {
  type PlacementAnalysis,
  type LearningPath,
  type PlacementTestData
} from "./schemas";

/**
 * Servicio simplificado para generar contenido personalizado
 * Se enfoca únicamente en análisis de pruebas de nivelación y generación de planes de aprendizaje concisos
 */
export class PlacementTestService {
  /**
   * Genera análisis y plan de aprendizaje conciso basado en los resultados de la prueba de nivelación
   */
  static async generateAnalysis(placementData: PlacementTestData): Promise<{
    analysis: PlacementAnalysis;
    learningPath: LearningPath;
  }> {
    try {
      // 1. Analizar los resultados de la prueba de nivelación
      const analysis = await AIService.analyzePlacementTest(placementData);

      // 2. Generar plan de aprendizaje conciso y personalizado
      const learningPath = await AIService.generateLearningPath(analysis);
      const topics = learningPath.topics.map((topic) => ({
        ...topic,
        id: randomUUID()
      }));

      return {
        analysis,
        learningPath: { ...learningPath, id: randomUUID(), topics }
      };
    } catch (error) {
      console.error("Error generating personalized content:", error);
      throw new Error("Error al generar contenido personalizado");
    }
  }
}
