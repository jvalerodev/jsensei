import { generateObject } from "ai";
import { google } from "../google";
import {
  SimpleGeneratedContentSchema,
  type SimpleGeneratedContent
} from "../schemas";

/**
 * Servicio de IA para generar contenido específico de topics
 */
export class TopicContentAIService {
  // Modelo local configurado
  private static readonly DEFAULT_MODEL = "gemini-2.5-flash";

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
        model: google(this.DEFAULT_MODEL),
        schema: SimpleGeneratedContentSchema,
        prompt,
        temperature: 0.8
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
        ? "principiante (conceptos básicos, explicaciones detalladas y paso a paso)"
        : "intermedio (conceptos más avanzados, explicaciones concisas pero completas)";

    return `Eres un tutor experto de JavaScript especializado en enseñanza personalizada. Tu objetivo es crear contenido educativo de alta calidad que será mostrado en una aplicación web y almacenado en base de datos.

═══════════════════════════════════════════════════════════════════
📚 INFORMACIÓN DEL TOPIC
═══════════════════════════════════════════════════════════════════
• Título: ${topicTitle}
• Objetivo de aprendizaje: ${topicObjective}
• Temas a cubrir: ${topicSubjects.join(", ")}

═══════════════════════════════════════════════════════════════════
👤 PERFIL DEL ESTUDIANTE
═══════════════════════════════════════════════════════════════════
• Nivel: ${userSkillLevel} (${levelDescription})
• Áreas que necesitan refuerzo: ${
      userWeakAreas.length > 0
        ? userWeakAreas.join(", ")
        : "Ninguna identificada"
    }
• Áreas de fortaleza: ${
      userStrongAreas.length > 0
        ? userStrongAreas.join(", ")
        : "Ninguna identificada"
    }

═══════════════════════════════════════════════════════════════════
📝 INSTRUCCIONES PARA GENERAR EL CONTENIDO
═══════════════════════════════════════════════════════════════════

1. **ESTRUCTURA DE LA LECCIÓN**:
   - Comienza con una introducción motivadora (2-3 líneas)
   - Explica CADA tema de la lista de manera secuencial y progresiva
   - Usa subtítulos (##, ###) para organizar los conceptos
   - Incluye listas con viñetas (-) para puntos clave
   - Usa **negritas** para términos importantes y \`código inline\` para sintaxis
   - Termina con una sección "🎯 Puntos Clave" resumiendo lo aprendido

2. **PERSONALIZACIÓN**:
   - Si hay áreas débiles relacionadas, dedica más atención y ejemplos a esas
   - Si hay áreas fuertes, úsalas como punto de partida para explicaciones
   - Adapta el vocabulario y profundidad al nivel del estudiante

3. **FORMATO MARKDOWN**:
   - El contenido DEBE ser compatible con renderizado web
   - Usa correctamente: \`código inline\`, bloques de código, negritas, listas
   - Los bloques de código deben usar \`\`\`javascript para syntax highlighting
   - NO uses caracteres especiales que puedan causar problemas en JSON/DB

4. **EJEMPLOS DE CÓDIGO** (Máximo 2):
   - Ejemplo 1: Caso básico/fundamental del concepto
   - Ejemplo 2 (opcional): Caso práctico o comparativo más avanzado
   - CADA ejemplo debe tener:
     * Título descriptivo
     * Código limpio, bien comentado y ejecutable
     * Explicación de QUÉ hace, CÓMO funciona, y POR QUÉ es importante
     * Usa JavaScript moderno (ES6+): const/let, arrow functions, template strings, etc.

5. **EJERCICIOS DE EVALUACIÓN** (1-2 ejercicios):
   - Crea ejercicios que evalúen la COMPRENSIÓN, no solo memorización
   - Tipos disponibles:
     * **multiple-choice**: 4 opciones (3 distractores plausibles + 1 correcta)
     * **code-completion**: Código con espacios a completar (usa ___ para blancos)
     * **debugging**: Código con 1-2 errores sutiles a encontrar
     * **coding**: Descripción de un problema a resolver escribiendo código
   - CADA ejercicio debe incluir:
     * Pregunta clara y específica
     * Respuesta correcta precisa
     * Explicación detallada de POR QUÉ esa es la respuesta correcta
     * Dificultad acorde al nivel del estudiante

═══════════════════════════════════════════════════════════════════
📋 FORMATO JSON DE RESPUESTA
═══════════════════════════════════════════════════════════════════

{
  "title": "Título claro y descriptivo de la lección",
  "content": "## Introducción\n\nTexto introductorio motivador...\n\n## [Tema 1]\n\nExplicación detallada con ejemplos inline...\n\n### Subtema\n\nMás detalles...\n\n- Punto clave 1\n- Punto clave 2\n\nEjemplo inline: \`const x = 10;\`\n\n## [Tema 2]\n\n...\n\n## 🎯 Puntos Clave\n\n- Resumen punto 1\n- Resumen punto 2",
  "examples": [
    {
      "title": "Ejemplo 1: Caso fundamental",
      "code": "// Código JavaScript limpio y comentado\nconst nombre = 'Juan';\nconsole.log(\`Hola, \${nombre}\`);\n// Output: Hola, Juan",
      "explanation": "Este ejemplo demuestra... [explicación de qué hace, cómo funciona, y por qué es útil]"
    },
    {
      "title": "Ejemplo 2: Caso práctico avanzado",
      "code": "// Código más complejo pero realista",
      "explanation": "Explicación del caso avanzado..."
    }
  ],
  "exercises": [
    {
      "question": "Pregunta clara y específica sobre el concepto",
      "type": "multiple-choice",
      "options": ["Opción incorrecta pero plausible", "Respuesta correcta", "Distractor 2", "Distractor 3"],
      "correctAnswer": "Respuesta correcta (debe coincidir exactamente con una opción)",
      "explanation": "Explicación detallada de por qué esta respuesta es correcta y por qué las otras son incorrectas",
      "difficulty": "${userSkillLevel}"
    },
    {
      "question": "Segunda pregunta para reforzar otro aspecto",
      "type": "code-completion",
      "options": [],
      "correctAnswer": "Código o respuesta correcta",
      "explanation": "Explicación de la solución",
      "difficulty": "${userSkillLevel}"
    }
  ]
}

═══════════════════════════════════════════════════════════════════
⚠️ REGLAS IMPORTANTES
═══════════════════════════════════════════════════════════════════
✓ Contenido en español claro y profesional
✓ Markdown válido compatible con web
✓ Código JavaScript moderno (ES6+)
✓ Ejemplos ejecutables y prácticos
✓ Ejercicios que evalúan comprensión real
✓ JSON válido sin caracteres especiales problemáticos
✓ Máximo 2 ejemplos, 1-2 ejercicios
✗ NO uses emojis en el código
✗ NO incluyas texto fuera del JSON
✗ NO uses caracteres que rompan el JSON/DB

Genera ÚNICAMENTE el JSON válido, sin texto adicional antes o después.`;
  }
}
