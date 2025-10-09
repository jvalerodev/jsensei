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

5. **EJERCICIOS DE EVALUACIÓN** (EXACTAMENTE 6 ejercicios):
   
   **DISTRIBUCIÓN OBLIGATORIA:**
   
   - **3 EJERCICIOS TEÓRICOS DE SELECCIÓN MÚLTIPLE** (TODOS con 4 opciones):
   
     a) **1 ejercicio tipo "multiple-choice"** (pregunta conceptual):
        * Pregunta teórica sobre el concepto
        * 4 opciones de texto (1 correcta + 3 distractores plausibles)
        * Ejemplo: "¿Qué es una closure en JavaScript?"
   
     b) **1 ejercicio tipo "code-completion"** (completar código):
        * Muestra código con espacios en blanco marcados como \`___\`
        * Usa bloques de código markdown: \`\`\`javascript
        * 4 opciones de QUÉ código va en el espacio (1 correcta + 3 incorrectas)
        * Ejemplo pregunta: "Completa el código: \`\`\`javascript\\nfunction suma(a, b) {\\n  ___ a + b;\\n}\\n\`\`\`"
        * Ejemplo opciones: ["return", "console.log", "const result =", "let sum ="]
   
     c) **1 ejercicio tipo "debugging"** (encontrar error):
        * Muestra código CON un error usando markdown: \`\`\`javascript
        * 4 opciones de cuál es el error Y cómo corregirlo (1 correcta + 3 incorrectas)
        * Ejemplo pregunta: "¿Qué está mal en este código?\\n\`\`\`javascript\\nconst x = 10;\\nx = 20;\\n\`\`\`"
        * Ejemplo opciones: ["No se puede reasignar const, cambiar a let", "Falta punto y coma", "x debe ser var", "El valor debe ser string"]
   
   - **3 EJERCICIOS PRÁCTICOS DE CÓDIGO** (tipo **coding** únicamente):
     * Problemas que requieren escribir código desde cero
     * De dificultad progresiva (fácil, medio, desafiante)
     * Relacionados con los conceptos de la lección
   
   **REGLAS CRÍTICAS PARA EJERCICIOS TEÓRICOS:**
   - TODOS deben tener EXACTAMENTE 4 opciones en el array "options"
   - TODOS deben incluir "correctAnswer" que coincida EXACTAMENTE con una de las 4 opciones
   - Usa formato markdown (\`\`\`javascript) para mostrar código en preguntas
   - Las opciones deben ser texto plano (aunque describan código)
   - Explicación detallada de por qué esa opción es correcta
   - La explicación PUEDE incluir formato markdown (código inline con \`, bloques de código con \`\`\`javascript, negritas con **, listas, etc.)
   
   **REGLAS PARA EJERCICIOS PRÁCTICOS (coding):**
   - NO incluir campo "correctAnswer" (hay múltiples soluciones válidas)
   - El array "options" debe estar vacío: []
   - La explicación debe describir conceptos a aplicar y criterios de evaluación
   - Pueden incluir código de ejemplo en la pregunta usando markdown
   
   - Todos los ejercicios deben tener:
     * Pregunta clara con código en formato markdown si aplica
     * Dificultad acorde al nivel: ${userSkillLevel}

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
      "question": "¿Cuál es la diferencia entre let y const en JavaScript?",
      "type": "multiple-choice",
      "options": [
        "let permite reasignación, const no",
        "const es más rápido que let",
        "let es para números, const para strings",
        "No hay diferencia"
      ],
      "correctAnswer": "let permite reasignación, const no",
      "explanation": "La principal diferencia es que let permite cambiar el valor de la variable, mientras que const no permite reasignación después de la declaración inicial.",
      "difficulty": "${userSkillLevel}"
    },
    {
      "question": "Completa el código para que la función retorne la suma correctamente:\\n\`\`\`javascript\\nfunction sumar(a, b) {\\n  ___ a + b;\\n}\\n\`\`\`",
      "type": "code-completion",
      "options": [
        "return",
        "console.log",
        "const resultado =",
        "alert"
      ],
      "correctAnswer": "return",
      "explanation": "La palabra clave **return** es necesaria para devolver el resultado de la suma.\\n\\nSin ella, la función retornaría \`undefined\`. Ejemplo correcto:\\n\`\`\`javascript\\nfunction sumar(a, b) {\\n  return a + b;\\n}\\nconsole.log(sumar(2, 3)); // 5\\n\`\`\`",
      "difficulty": "${userSkillLevel}"
    },
    {
      "question": "¿Qué error tiene este código y cómo se corrige?\\n\`\`\`javascript\\nconst nombre = 'Juan';\\nnombre = 'Pedro';\\nconsole.log(nombre);\\n\`\`\`",
      "type": "debugging",
      "options": [
        "No se puede reasignar una variable const, debe cambiarse a let",
        "Falta punto y coma al final",
        "El nombre de la variable debe empezar con mayúscula",
        "console.log debe ir antes de la reasignación"
      ],
      "correctAnswer": "No se puede reasignar una variable const, debe cambiarse a let",
      "explanation": "**const** declara una constante que **no puede ser reasignada**. El error ocurre en la línea 2 al intentar cambiar el valor.\\n\\n**Solución:** Cambiar \`const\` por \`let\`:\\n\`\`\`javascript\\nlet nombre = 'Juan';\\nnombre = 'Pedro'; // Ahora funciona\\nconsole.log(nombre); // 'Pedro'\\n\`\`\`\\n\\nUsa \`const\` solo para valores que no cambiarán.",
      "difficulty": "${userSkillLevel}"
    },
    {
      "question": "Escribe una función que reciba un array de números y retorne la suma de todos sus elementos.\\n\\nEjemplo: sumarArray([1, 2, 3, 4]) debe retornar 10",
      "type": "coding",
      "options": [],
      "explanation": "Este ejercicio evalúa: (1) Declaración correcta de funciones, (2) Iteración sobre arrays usando for o métodos como reduce, (3) Acumulación de valores, (4) Retorno del resultado. El estudiante debe demostrar comprensión de estructuras de control y manejo de arrays.",
      "difficulty": "${userSkillLevel}"
    },
    {
      "question": "Crea una función que reciba un string y retorne true si es un palíndromo (se lee igual al derecho y al revés) y false en caso contrario. Ignora espacios y diferencias entre mayúsculas y minúsculas.\\n\\nEjemplo: esPalindromo('Anita lava la tina') debe retornar true",
      "type": "coding",
      "options": [],
      "explanation": "Criterios de evaluación: (1) Normalización del string (eliminar espacios, convertir a minúsculas), (2) Comparación del string con su versión invertida, (3) Retorno correcto de booleano. Conceptos: métodos de strings (split, reverse, join, toLowerCase, replace), lógica de comparación.",
      "difficulty": "${userSkillLevel}"
    },
    {
      "question": "Implementa una función que simule un sistema de carrito de compras. Debe poder: (1) Agregar productos (nombre, precio, cantidad), (2) Eliminar productos, (3) Calcular el total. Usa un array de objetos para almacenar los productos.\\n\\nEjemplo de uso:\\n\`\`\`javascript\\nconst carrito = crearCarrito();\\ncarrito.agregar('Manzana', 2.5, 3);\\ncarrito.agregar('Pan', 1.5, 2);\\nconsole.log(carrito.calcularTotal()); // 10.5\\n\`\`\`",
      "type": "coding",
      "options": [],
      "explanation": "Este ejercicio avanzado evalúa: (1) Diseño de estructura de datos (objetos y arrays), (2) Implementación de métodos (agregar, eliminar, calcular), (3) Manipulación de arrays de objetos, (4) Cálculos con números. Demuestra dominio de: objetos, arrays, métodos, arrow functions, operaciones con datos estructurados.",
      "difficulty": "${userSkillLevel}"
    }
  ]
}

═══════════════════════════════════════════════════════════════════
⚠️ REGLAS CRÍTICAS - LEE CUIDADOSAMENTE
═══════════════════════════════════════════════════════════════════

**ESTRUCTURA DE EJERCICIOS OBLIGATORIA:**
✓ EXACTAMENTE 6 ejercicios total
✓ Ejercicios 1-3: Teóricos con selección múltiple (TODOS con 4 opciones + correctAnswer)
  • Ejercicio 1: tipo "multiple-choice" - pregunta conceptual
  • Ejercicio 2: tipo "code-completion" - completar código con 4 opciones
  • Ejercicio 3: tipo "debugging" - encontrar error con 4 opciones de solución
✓ Ejercicios 4-6: Prácticos tipo "coding" (SIN correctAnswer, options vacío [])

**FORMATO DE CÓDIGO Y MARKDOWN:**
✓ Usa \`\`\`javascript para bloques de código en preguntas
✓ Usa \\n para saltos de línea dentro del JSON
✓ Las opciones en ejercicios teóricos son texto plano (aunque describan código)
✓ Las EXPLICACIONES pueden usar markdown completo:
  • Código inline: \`variable\`
  • Bloques de código: \`\`\`javascript\\nconst x = 10;\\n\`\`\`
  • Negritas: **importante**
  • Listas: - Punto 1\\n- Punto 2
✓ Ejemplo pregunta: "Completa:\\n\`\`\`javascript\\nconst x = ___;\\n\`\`\`"
✓ Ejemplo explicación: "La palabra **return** es necesaria.\\n\\nEjemplo:\\n\`\`\`javascript\\nreturn resultado;\\n\`\`\`"

**REGLAS GENERALES:**
✓ Contenido en español claro y profesional
✓ Markdown válido compatible con web (usa \\n, no saltos reales)
✓ Código JavaScript moderno (ES6+)
✓ Ejemplos ejecutables y prácticos (máximo 2)
✓ JSON válido sin caracteres especiales problemáticos

✗ NO uses emojis en el código
✗ NO incluyas texto fuera del JSON
✗ NO pongas "correctAnswer" en ejercicios tipo "coding"
✗ NO uses saltos de línea reales (usa \\n)
✗ NO dejes "options" vacío en ejercicios teóricos

Genera ÚNICAMENTE el JSON válido, sin texto adicional antes o después.`;
  }
}
