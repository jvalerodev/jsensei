// AI Content Generation utilities for JSensei
export interface ContentRequest {
  topic: string;
  level: "principiante" | "intermedio" | "avanzado";
  type: "explanation" | "exercise" | "example";
  userId: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  exercises?: Exercise[];
  examples?: CodeExample[];
}

export interface Exercise {
  id: string;
  question: string;
  type: "multiple-choice" | "code-completion" | "debugging";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CodeExample {
  title: string;
  code: string;
  explanation: string;
}

// Mock AI content generation - can be replaced with actual AI service
export async function generateContent(
  request: ContentRequest
): Promise<GeneratedContent> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mockContent = getMockContent(
    request.topic,
    request.level,
    request.type
  );
  return mockContent;
}

function getMockContent(
  topic: string,
  level: string,
  type: string
): GeneratedContent {
  const contentMap = {
    variables: {
      principiante: {
        explanation: {
          title: "Variables en JavaScript",
          content: `Las variables son contenedores que almacenan datos. En JavaScript, puedes declarar variables usando 'let', 'const' o 'var'.

**let**: Para variables que pueden cambiar
**const**: Para valores constantes
**var**: Forma antigua (no recomendada)

Ejemplo:
\`\`\`javascript
let nombre = "Juan";
const edad = 25;
\`\`\``,
          examples: [
            {
              title: "Declaración de variables",
              code: 'let mensaje = "Hola mundo";\nconst PI = 3.14159;\nlet contador = 0;',
              explanation:
                "Aquí declaramos diferentes tipos de variables con valores iniciales."
            }
          ]
        }
      }
    }
  };

  const topicData = contentMap[topic as keyof typeof contentMap];
  const levelData = topicData?.[level as keyof typeof topicData];
  const typeData = levelData?.[type as keyof typeof levelData];

  return (
    typeData || {
      title: `${topic} - ${level}`,
      content: `Contenido generado para ${topic} en nivel ${level}. Este es contenido de ejemplo que será reemplazado por IA real.`,
      examples: [
        {
          title: "Ejemplo básico",
          code: '// Código de ejemplo\nconsole.log("Hola mundo");',
          explanation: "Este es un ejemplo básico del concepto."
        }
      ]
    }
  );
}

export async function evaluateExercise(
  exerciseId: string,
  userAnswer: string,
  correctAnswer: string
): Promise<{
  isCorrect: boolean;
  feedback: string;
  suggestions: string[];
}> {
  // Mock evaluation - can be replaced with actual AI evaluation
  const isCorrect =
    userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  return {
    isCorrect,
    feedback: isCorrect
      ? "¡Excelente! Tu respuesta es correcta."
      : "No es correcto. Revisa el concepto y vuelve a intentarlo.",
    suggestions: isCorrect
      ? ["Continúa con el siguiente ejercicio"]
      : ["Revisa la explicación del tema", "Practica con ejemplos similares"]
  };
}
