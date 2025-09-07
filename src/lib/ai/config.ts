/**
 * Configuración para el servicio de IA
 */
export const AIConfig = {
  // Modelos de OpenAI disponibles
  models: {
    default: "gpt-4o-mini",
    creative: "gpt-4o",
    fast: "gpt-3.5-turbo"
  },

  // Configuración de temperatura para diferentes tipos de generación
  temperature: {
    creative: 0.8,
    balanced: 0.7,
    precise: 0.3,
    analytical: 0.1
  },

  // Límites de tokens para diferentes tipos de contenido
  maxTokens: {
    content: 4000,
    exercises: 2000,
    evaluation: 1000,
    explanation: 1500
  },

  // Configuración de retry para fallos de API
  retry: {
    maxAttempts: 3,
    delayMs: 1000
  },

  // Configuración de validación
  validation: {
    maxExercisesPerRequest: 10,
    maxContentLength: 10000,
    minContentLength: 100
  }
} as const;

/**
 * Verifica que las variables de entorno necesarias estén configuradas
 */
export function validateAIConfig(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY no está configurada en las variables de entorno"
    );
  }
}

/**
 * Obtiene la configuración de un modelo específico
 */
export function getModelConfig(modelType: keyof typeof AIConfig.models) {
  return {
    model: AIConfig.models[modelType],
    temperature: AIConfig.temperature.balanced,
    maxTokens: AIConfig.maxTokens.content
  };
}
