import { randomUUID } from "node:crypto";

import {
  LearningPath,
  PlacementAnalysis,
  PlacementTestData
} from "@/lib/ai/schemas";
import { PlacementTestAIService } from "@/lib/ai";

/**
 * Servicio para generar análisis y plan de aprendizaje conciso basado en los resultados de la prueba de nivelación
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
      const analysis = await PlacementTestAIService.analyzePlacementTest(
        placementData
      );

      // 2. Generar plan de aprendizaje conciso y personalizado
      const learningPath = await PlacementTestAIService.generateLearningPath(
        analysis
      );
      const topics = learningPath.topics.map((topic) => ({
        ...topic,
        id: randomUUID()
      }));

      return {
        analysis,
        learningPath: { ...learningPath, id: randomUUID(), topics }
      };
    } catch (error) {
      console.error("Error generating analysis and learning path:", error);
      throw new Error("Error al generar análisis y plan de aprendizaje");
    }
  }
}
