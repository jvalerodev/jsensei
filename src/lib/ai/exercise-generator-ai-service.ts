import { generateObject } from "ai";
import { google } from "./google";
import { SimpleExerciseSchema, type SimpleExercise } from "./schemas";

/**
 * Servicio de IA para generar ejercicios individuales
 */
export class ExerciseGeneratorAIService {
  private static readonly DEFAULT_MODEL = "gemini-2.5-flash";

  /**
   * Genera un ejercicio individual del tipo especificado
   */
  static async generateSingleExercise(
    topicTitle: string,
    topicContext: string,
    exerciseType: "multiple-choice" | "code-completion" | "debugging" | "coding",
    userSkillLevel: "beginner" | "intermediate",
    previousExercise?: {
      question: string;
      options?: string[];
      correctAnswer: string;
    }
  ): Promise<SimpleExercise> {
    try {
      const prompt = this.buildExercisePrompt(
        topicTitle,
        topicContext,
        exerciseType,
        userSkillLevel,
        previousExercise
      );

      console.log(
        `🤖 Generando ejercicio de tipo "${exerciseType}" para topic: "${topicTitle}"...`
      );

      const result = await generateObject({
        model: google(this.DEFAULT_MODEL),
        schema: SimpleExerciseSchema,
        prompt,
        // Mayor temperatura cuando se regenera para más variedad
        temperature: previousExercise ? 1.2 : 0.9
      });

      console.log(`✅ Ejercicio generado exitosamente`);
      return result.object;
    } catch (error) {
      console.error(
        `❌ Error generando ejercicio de tipo "${exerciseType}":`,
        error
      );
      throw new Error(
        `Error al generar ejercicio de tipo: ${exerciseType}`
      );
    }
  }

  /**
   * Construye el prompt para generar un ejercicio específico
   */
  private static buildExercisePrompt(
    topicTitle: string,
    topicContext: string,
    exerciseType: "multiple-choice" | "code-completion" | "debugging" | "coding",
    userSkillLevel: "beginner" | "intermediate",
    previousExercise?: {
      question: string;
      options?: string[];
      correctAnswer: string;
    }
  ): string {
    const levelDescription =
      userSkillLevel === "beginner"
        ? "principiante (conceptos básicos, sin trucos complicados)"
        : "intermedio (conceptos más avanzados pero claros)";

    const typeInstructions = this.getTypeSpecificInstructions(exerciseType);

    // Construir sección de ejercicio anterior si existe
    const previousExerciseSection = previousExercise ? `
═══════════════════════════════════════════════════════════════════
🚫 EJERCICIO ANTERIOR A EVITAR
═══════════════════════════════════════════════════════════════════
El estudiante ya intentó este ejercicio y necesita uno DIFERENTE:

Pregunta anterior: ${previousExercise.question}
${previousExercise.options ? `Opciones anteriores: ${previousExercise.options.join(', ')}` : ''}
Respuesta correcta anterior: ${previousExercise.correctAnswer}

⚠️ IMPORTANTE: Debes generar un ejercicio que sea:
• DIFERENTE en la pregunta (no solo parafrasear)
• DIFERENTE en el concepto específico evaluado (mismo tema general, pero diferente aspecto)
• DIFERENTE en los ejemplos de código (si aplica)
• Con opciones COMPLETAMENTE distintas (si aplica)
• Con un enfoque o ángulo diferente del mismo topic

` : '';

    return `Eres un tutor experto de JavaScript especializado en crear ejercicios educativos de calidad.

═══════════════════════════════════════════════════════════════════
📚 CONTEXTO DEL TOPIC
═══════════════════════════════════════════════════════════════════
• Topic: ${topicTitle}
• Contexto: ${topicContext}
• Nivel del estudiante: ${userSkillLevel} (${levelDescription})
${previousExerciseSection}
═══════════════════════════════════════════════════════════════════
📝 TIPO DE EJERCICIO A GENERAR: ${exerciseType}
═══════════════════════════════════════════════════════════════════

${typeInstructions}

═══════════════════════════════════════════════════════════════════
⚠️ REGLAS IMPORTANTES
═══════════════════════════════════════════════════════════════════
✓ El ejercicio debe ser SIGNIFICATIVAMENTE DIFERENTE al anterior (si existe)
✓ Pregunta clara y específica sobre el concepto
✓ Respuesta correcta precisa y verificable
✓ Explicación detallada de POR QUÉ esa es la respuesta correcta
✓ Dificultad acorde al nivel: ${userSkillLevel}
✓ Contenido en español claro y profesional
✓ JSON válido sin caracteres especiales problemáticos
✗ NO uses preguntas triviales o de memorización
✗ NO incluyas texto fuera del JSON
✗ NO uses código no ejecutable

═══════════════════════════════════════════════════════════════════
📋 FORMATO JSON DE RESPUESTA
═══════════════════════════════════════════════════════════════════

{
  "question": "Pregunta clara y específica del ejercicio",
  "type": "${exerciseType}",
  "options": ${exerciseType === "multiple-choice" ? '["Opción 1", "Opción 2 (correcta)", "Opción 3", "Opción 4"]' : "[]"},
  "correctAnswer": "Respuesta correcta exacta${exerciseType === "multiple-choice" ? " (debe coincidir con una de las opciones)" : ""}",
  "explanation": "Explicación detallada de por qué esta respuesta es correcta y conceptos relacionados",
  "difficulty": "${userSkillLevel}"
}

Genera ÚNICAMENTE el JSON válido, sin texto adicional antes o después.`;
  }

  /**
   * Obtiene instrucciones específicas según el tipo de ejercicio
   */
  private static getTypeSpecificInstructions(
    exerciseType: "multiple-choice" | "code-completion" | "debugging" | "coding"
  ): string {
    const instructions = {
      "multiple-choice": `
**Instrucciones para MULTIPLE-CHOICE:**
• Crea una pregunta con 4 opciones (1 correcta + 3 distractores plausibles)
• Los distractores deben ser errores comunes o conceptos relacionados
• La respuesta correcta debe coincidir EXACTAMENTE con una de las opciones
• Incluye código en las opciones si es relevante (usando backticks)
• Ejemplo de formato de opciones:
  ["const permite reasignación de valores", "let es para constantes", "const no permite reasignación de valores", "var es la mejor opción en ES6"]`,

      "code-completion": `
**Instrucciones para CODE-COMPLETION:**
• Presenta un código con espacios en blanco marcados con ___
• El estudiante debe completar los espacios en blanco
• La respuesta correcta debe ser lo que va en los espacios (separado por comas si son múltiples)
• Ejemplo:
  question: "Completa el código para declarar una constante: ___ nombre = 'Juan';"
  correctAnswer: "const"`,

      "debugging": `
**Instrucciones para DEBUGGING:**
• Presenta código con 1-2 errores sutiles pero realistas
• El error debe ser conceptual, no typos obvios
• La respuesta correcta debe explicar el error y cómo corregirlo
• Ejemplo:
  question: "¿Qué está mal en este código?\n\`\`\`javascript\nconst x = 10;\nx = 20;\nconsole.log(x);\n\`\`\`"
  correctAnswer: "No puedes reasignar una constante. Deberías usar 'let' en lugar de 'const' si necesitas reasignar."`,

      "coding": `
**Instrucciones para CODING:**
• Describe un problema práctico que requiere escribir código
• El problema debe ser pequeño pero realista (2-5 líneas de código)
• La respuesta correcta debe ser código funcional y ejecutable
• Ejemplo:
  question: "Escribe una función que reciba un nombre y retorne un saludo personalizado"
  correctAnswer: "function saludar(nombre) { return \`Hola, \${nombre}!\`; }"`
    };

    return instructions[exerciseType];
  }
}
