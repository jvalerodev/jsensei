import { generateObject } from "ai";
import { ollama } from "ollama-ai-provider-v2";
import {
  SimpleGeneratedContentSchema,
  type SimpleGeneratedContent
} from "./schemas";

/**
 * Servicio de IA para generar contenido específico de topics
 */
export class TopicContentAIService {
  // Modelo local configurado
  private static readonly DEFAULT_MODEL = "codellama:7b";

  /**
   * Genera contenido educativo para un topic específico usando IA
   */
  static async generateTopicContent(
    topicTitle: string,
    topicObjective: string,
    topicSubjects: string[],
    userSkillLevel: "beginner" | "intermediate",
    userWeakAreas: string[] = [],
    userStrongAreas: string[] = []
  ): Promise<SimpleGeneratedContent> {
    try {
      const prompt = this.buildTopicContentPrompt(
        topicTitle,
        topicObjective,
        topicSubjects,
        userSkillLevel,
        userWeakAreas,
        userStrongAreas
      );

      console.log(
        `🤖 Generando contenido para topic: "${topicTitle}" con IA...`
      );

      const result = await generateObject({
        model: ollama(this.DEFAULT_MODEL),
        schema: SimpleGeneratedContentSchema,
        prompt,
        temperature: 0.7
      });

      console.log(`✅ Contenido generado exitosamente para: "${topicTitle}"`);
      return result.object;
    } catch (error) {
      console.error(
        `❌ Error generating content for topic "${topicTitle}":`,
        error
      );
      throw new Error(
        `Error al generar contenido para el topic: ${topicTitle}`
      );
    }
  }

  /**
   * Construye el prompt para generar contenido de un topic específico
   */
  private static buildTopicContentPrompt(
    topicTitle: string,
    topicObjective: string,
    topicSubjects: string[],
    userSkillLevel: "beginner" | "intermediate",
    userWeakAreas: string[],
    userStrongAreas: string[]
  ): string {
    const levelDescription =
      userSkillLevel === "beginner"
        ? "principiante (conceptos básicos, explicaciones detalladas)"
        : "intermedio (conceptos más avanzados, menos explicaciones básicas)";

    return `Eres un tutor experto de JavaScript. Genera contenido educativo completo para un topic específico.

INFORMACIÓN DEL TOPIC:
- Título: ${topicTitle}
- Objetivo: ${topicObjective}
- Temas a cubrir: ${topicSubjects.join(", ")}

INFORMACIÓN DEL ESTUDIANTE:
- Nivel: ${userSkillLevel} (${levelDescription})
- Áreas débiles: ${
      userWeakAreas.length > 0
        ? userWeakAreas.join(", ")
        : "Ninguna identificada"
    }
- Áreas fuertes: ${
      userStrongAreas.length > 0
        ? userStrongAreas.join(", ")
        : "Ninguna identificada"
    }

INSTRUCCIONES:
1. Genera una lección completa que cubra todos los temas mencionados
2. Adapta el contenido al nivel del estudiante
3. Si hay áreas débiles relacionadas, enfócate más en esas
4. Incluye explicaciones claras y progresivas
5. Proporciona 1 ejemplo de código práctico y bien comentado
6. Crea 1 ejercicio práctico de diferentes tipos:
   - multiple-choice: Preguntas de opción múltiple
   - code-completion: Completar código
   - debugging: Encontrar y corregir errores
   - coding: Escribir código desde cero
7. Cada ejercicio debe tener su respuesta correcta y explicación

FORMATO DE RESPUESTA (JSON):
{
  "title": "Título de la lección",
  "content": "Contenido educativo completo en markdown. Incluye explicaciones detalladas, conceptos clave, y cómo se relacionan los temas. Usa formato markdown para estructura (##, ###, -, *, etc.)",
  "examples": [
    {
      "title": "Nombre del ejemplo",
      "code": "// Código JavaScript bien comentado\nconsole.log('ejemplo');",
      "explanation": "Explicación detallada de qué hace el código y por qué es importante"
    }
  ],
  "exercises": [
    {
      "question": "Pregunta del ejercicio",
      "type": "multiple-choice" | "code-completion" | "debugging" | "coding",
      "options": ["opción1", "opción2", "opción3", "opción4"] // Solo para multiple-choice,
      "correctAnswer": "Respuesta correcta",
      "explanation": "Explicación detallada de por qué esta es la respuesta correcta",
      "difficulty": "${userSkillLevel}"
    }
  ]
}

IMPORTANTE:
- El contenido debe ser educativo y progresivo
- Los ejemplos deben ser prácticos y relevantes
- Los ejercicios deben evaluar la comprensión del tema
- Adapta la complejidad al nivel del estudiante
- Usa JavaScript moderno (ES6+) en los ejemplos

Responde SOLO con el JSON válido, sin texto adicional.`;
  }
}
