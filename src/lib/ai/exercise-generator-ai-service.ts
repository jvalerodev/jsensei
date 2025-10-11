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
        ? "principiante (conceptos básicos, explicaciones detalladas y sin trucos complicados)"
        : "intermedio (conceptos más avanzados, explicaciones concisas pero completas)";

    const typeInstructions = this.getTypeSpecificInstructions(exerciseType);
    
    const actionWord = previousExercise ? "REGENERAR" : "GENERAR";
    const actionDescription = previousExercise 
      ? "regenerar un ejercicio SIMILAR al anterior pero con contenido DIFERENTE"
      : "generar un nuevo ejercicio educativo de calidad";

    // Construir sección de ejercicio anterior si existe
    const previousExerciseSection = previousExercise ? `
═══════════════════════════════════════════════════════════════════
🔄 EJERCICIO A REGENERAR
═══════════════════════════════════════════════════════════════════
El estudiante ya intentó este ejercicio sin éxito y necesita uno SIMILAR pero DIFERENTE:

**Pregunta anterior:**
${previousExercise.question}

${previousExercise.options && previousExercise.options.length > 0 ? `**Opciones anteriores:**\n${previousExercise.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n` : ''}
**Respuesta correcta anterior:**
${previousExercise.correctAnswer}

**⚠️ IMPORTANTE - Requisitos de regeneración:**
• El ejercicio debe ser SIMILAR en tema y tipo (mantener el concepto evaluado)
• Pero COMPLETAMENTE DIFERENTE en:
  ✗ La pregunta específica (cambiar el ángulo o caso de uso)
  ✗ Los ejemplos de código usados (si aplica)
  ✗ Las opciones de respuesta (reformular completamente)
  ✗ La respuesta correcta (diferente ejemplo/explicación del mismo concepto)
• El objetivo es dar al estudiante OTRA OPORTUNIDAD de aprender el mismo concepto
• Mantén el mismo nivel de dificultad: ${userSkillLevel}

` : '';

    return `Eres un tutor experto de JavaScript especializado en crear ejercicios educativos personalizados. Tu objetivo es ${actionDescription} que será mostrado en una aplicación web y almacenado en base de datos.

═══════════════════════════════════════════════════════════════════
📚 CONTEXTO DEL TOPIC
═══════════════════════════════════════════════════════════════════
• **Topic:** ${topicTitle}
• **Contexto adicional:** ${topicContext || "Sin contexto adicional"}
• **Nivel del estudiante:** ${userSkillLevel} (${levelDescription})
${previousExerciseSection}
═══════════════════════════════════════════════════════════════════
📝 TIPO DE EJERCICIO A ${actionWord}: ${exerciseType}
═══════════════════════════════════════════════════════════════════

${typeInstructions}

═══════════════════════════════════════════════════════════════════
⚠️ REGLAS CRÍTICAS - LEE CUIDADOSAMENTE
═══════════════════════════════════════════════════════════════════

**ESTRUCTURA DEL EJERCICIO:**
${exerciseType !== "coding" 
  ? "✓ GENERAR EXACTAMENTE 4 OPCIONES: 1 correcta + 3 distractores plausibles\n✓ La respuesta correcta debe coincidir EXACTAMENTE con una de las 4 opciones\n✓ Los distractores deben ser errores comunes o conceptos relacionados" 
  : "✓ NO incluir campo 'correctAnswer' (múltiples soluciones válidas)\n✓ El array 'options' debe estar vacío: []\n✓ La 'explanation' describe criterios de evaluación"}

**FORMATO DE CÓDIGO Y MARKDOWN:**
✓ TODO EL CÓDIGO debe usar formato Markdown de GitHub: \`\`\`javascript\\ncódigo aquí\\n\`\`\`
✓ Usa \\n para saltos de línea dentro del JSON (NO saltos reales)
✓ Las opciones (si aplica) son texto plano describiendo el código
✓ La explicación PUEDE usar markdown completo:
  • Código inline: \`variable\`
  • Bloques de código: \`\`\`javascript\\nconst x = 10;\\n\`\`\`
  • Negritas: **importante**
  • Listas: - Punto 1\\n- Punto 2

**CONTENIDO Y CALIDAD:**
${previousExercise 
  ? "✓ El ejercicio debe ser SIMILAR en concepto pero DIFERENTE en implementación\n✓ Mantén el mismo nivel de dificultad del ejercicio anterior\n✓ Cambia el enfoque, caso de uso o ejemplo específico" 
  : "✓ Pregunta clara y específica sobre el concepto del topic\n✓ Nivel de dificultad apropiado para: " + userSkillLevel}
✓ Explicación detallada de POR QUÉ esa es la respuesta correcta
✓ Contenido en español claro y profesional
✓ JSON válido sin caracteres especiales problemáticos

**PROHIBICIONES:**
✗ NO uses preguntas triviales o de memorización
✗ NO incluyas texto fuera del JSON
✗ NO uses código no ejecutable o sin formato markdown
${previousExercise ? "✗ NO repitas la misma pregunta o ejemplos del ejercicio anterior\n✗ NO uses las mismas opciones o respuestas" : ""}

═══════════════════════════════════════════════════════════════════
📋 FORMATO JSON DE RESPUESTA
═══════════════════════════════════════════════════════════════════

{
  "question": "Pregunta clara y específica del ejercicio (usar \\n para saltos de línea)",
  "type": "${exerciseType}",
  "options": ${exerciseType !== "coding" ? '["Opción 1", "Opción 2", "Opción 3 (correcta)", "Opción 4"]' : "[]"},
  ${exerciseType !== "coding" ? '"correctAnswer": "Respuesta que coincide EXACTAMENTE con una opción",' : ''}
  "explanation": "Explicación detallada con markdown si es necesario (usar \\n para saltos)",
  "difficulty": "${userSkillLevel}"
}

═══════════════════════════════════════════════════════════════════

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
• Si la pregunta incluye código, usa formato markdown: \`\`\`javascript\\ncódigo\\n\`\`\`
• Ejemplo de pregunta con código:
  question: "¿Qué imprimirá este código?\\n\`\`\`javascript\\nconst x = 10;\\nconsole.log(x + 5);\\n\`\`\`"
  options: ["10", "15", "105", "Error"]
  correctAnswer: "15"`,

      "code-completion": `
**Instrucciones para CODE-COMPLETION (Formato Selección Múltiple):**
• Presenta un código con espacios en blanco marcados con ___
• El código DEBE estar en formato markdown: \`\`\`javascript\\ncódigo\\n\`\`\`
• Crea 4 opciones de respuesta (1 correcta + 3 distractores plausibles)
• Los distractores deben ser alternativas realistas pero incorrectas
• La respuesta correcta debe coincidir EXACTAMENTE con una de las opciones
• Ejemplo:
  question: "Completa el código para declarar una constante:\\n\`\`\`javascript\\n___ nombre = 'Juan';\\n\`\`\`"
  options: ["var", "let", "const", "function"]
  correctAnswer: "const"`,

      "debugging": `
**Instrucciones para DEBUGGING (Formato Selección Múltiple):**
• Presenta código con 1-2 errores sutiles pero realistas
• El código DEBE estar en formato markdown: \`\`\`javascript\\ncódigo\\n\`\`\`
• Crea 4 opciones que expliquen diferentes posibles problemas
• Solo 1 opción debe identificar correctamente el error
• Los distractores deben ser diagnósticos plausibles pero incorrectos
• Ejemplo:
  question: "¿Qué está mal en este código?\\n\`\`\`javascript\\nconst x = 10;\\nx = 20;\\nconsole.log(x);\\n\`\`\`"
  options: [
    "Falta punto y coma después de x = 20",
    "No puedes reasignar una constante. Deberías usar 'let' en lugar de 'const'",
    "La variable x no está definida correctamente",
    "console.log() debe ir antes de la reasignación"
  ]
  correctAnswer: "No puedes reasignar una constante. Deberías usar 'let' en lugar de 'const'"`,

      "coding": `
**Instrucciones para CODING:**
• Describe un problema práctico que requiere escribir código
• El problema debe ser pequeño pero realista (2-5 líneas de código)
• La respuesta correcta debe ser código funcional y ejecutable en formato markdown
• El criterio de evaluación (explanation) debe explicar qué se espera del código
• Ejemplo:
  question: "Escribe una función que reciba un nombre y retorne un saludo personalizado"
  correctAnswer: "\`\`\`javascript\\nfunction saludar(nombre) {\\n  return \\\`Hola, \${nombre}!\\\`;\\n}\\n\`\`\`"
  explanation: "La función debe: 1) Recibir un parámetro 'nombre', 2) Usar template literals para el saludo, 3) Retornar el string formateado"`
    };

    return instructions[exerciseType];
  }
}
