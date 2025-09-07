# Sistema de IA para JSensei

Este directorio contiene todos los servicios y utilidades relacionados con la generación de contenido educativo usando Inteligencia Artificial.

## Estructura

```
src/lib/ai/
├── schemas.ts                    # Esquemas de validación con Zod
├── ai-service.ts                 # Servicio principal de IA
├── content-generator-service.ts  # Servicio especializado para contenido educativo
├── placement-service.ts          # Servicio de prueba de nivelación (actualizado)
├── config.ts                     # Configuración del servicio de IA
├── utils.ts                      # Utilidades y helpers
└── README.md                     # Esta documentación
```

## Servicios Principales

### 1. AIService

Servicio base que maneja todas las interacciones con los modelos de IA.

**Métodos principales:**

- `generateEducationalContent()` - Genera contenido educativo personalizado
- `analyzePlacementTest()` - Analiza resultados de prueba de nivelación
- `generateLearningPath()` - Crea plan de aprendizaje personalizado
- `generateTargetedExercises()` - Genera ejercicios específicos
- `evaluateExerciseResponse()` - Evalúa respuestas de ejercicios

### 2. ContentGeneratorService

Servicio especializado para generar contenido educativo basado en los resultados de la prueba de nivelación.

**Métodos principales:**

- `generatePersonalizedContent()` - Genera contenido completo personalizado
- `generateTopicContent()` - Genera contenido para un tema específico
- `generateReinforcementExercises()` - Genera ejercicios de refuerzo
- `generateAdaptiveContent()` - Genera contenido que se adapta al progreso
- `evaluateExercise()` - Evalúa ejercicios con retroalimentación detallada

### 3. AIUtils

Utilidades para facilitar el uso de los servicios de IA.

**Métodos principales:**

- `generateSimpleContent()` - Genera contenido de forma simplificada
- `generateQuickExercises()` - Genera ejercicios rápidos
- `getConceptHelp()` - Obtiene ayuda adicional para conceptos
- `quickEvaluate()` - Evalúa respuestas de forma rápida

## Uso Básico

### Generar Contenido Personalizado

```typescript
import { ContentGeneratorService } from '@/lib/ai/content-generator-service';

// Generar contenido basado en prueba de nivelación
const result = await ContentGeneratorService.generatePersonalizedContent({
  userId: 'user-123',
  responses: [...], // Respuestas de la prueba
  questions: [...]  // Preguntas de la prueba
});

// Generar contenido para un tema específico
const content = await ContentGeneratorService.generateTopicContent(
  'async-await',
  'intermediate',
  ['promises', 'error-handling'], // Áreas débiles
  ['functions', 'arrays']         // Áreas fuertes
);
```

### Generar Ejercicios

```typescript
import { AIUtils } from "@/lib/ai/utils";

// Generar ejercicios rápidos
const exercises = await AIUtils.generateQuickExercises(
  "destructuring",
  "beginner",
  5 // cantidad
);

// Generar ejercicios de refuerzo
const reinforcement =
  await ContentGeneratorService.generateReinforcementExercises(
    "closures",
    "intermediate",
    ["scope", "lexical-environment"],
    3
  );
```

### Evaluar Respuestas

```typescript
import { ContentGeneratorService } from "@/lib/ai/content-generator-service";

const evaluation = await ContentGeneratorService.evaluateExercise(
  "exercise-123",
  "¿Cuál es la diferencia entre let y const?",
  "let permite reasignación, const no",
  "let permite reasignación, const no",
  "let se usa para variables que pueden cambiar, const para constantes"
);

console.log(evaluation);
// {
//   isCorrect: true,
//   score: 95,
//   feedback: "¡Excelente! Tu respuesta es correcta.",
//   suggestions: ["Continúa con el siguiente ejercicio"],
//   detailedExplanation: "Explicación detallada..."
// }
```

## Endpoints API

### POST /api/ai/generate-content

Genera contenido educativo personalizado.

**Body:**

```json
{
  "topic": "async-await",
  "skillLevel": "intermediate",
  "weakAreas": ["promises", "error-handling"],
  "strongAreas": ["functions", "arrays"],
  "focusAreas": ["async-await"]
}
```

### POST /api/ai/generate-personalized-content

Genera contenido completo basado en prueba de nivelación.

**Body:**

```json
{
  "responses": [
    {
      "questionId": "q1",
      "selectedAnswer": "let",
      "responseTime": 5000,
      "isCorrect": true
    }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "¿Cuál es la mejor forma de declarar una variable?",
      "correct_answer": "let",
      "difficulty_level": "beginner",
      "topic": "variables",
      "points": 10
    }
  ]
}
```

### POST /api/ai/generate-exercises

Genera ejercicios de refuerzo.

**Body:**

```json
{
  "topic": "closures",
  "skillLevel": "intermediate",
  "weakAreas": ["scope", "lexical-environment"],
  "count": 5
}
```

### POST /api/ai/evaluate-exercise

Evalúa una respuesta de ejercicio.

**Body:**

```json
{
  "exerciseId": "ex1",
  "exercise": "¿Qué es una closure?",
  "userAnswer": "Una función que tiene acceso a variables de su scope externo",
  "correctAnswer": "Una función que tiene acceso a variables de su scope externo",
  "explanation": "Las closures permiten que las funciones accedan a variables de su scope padre"
}
```

## Configuración

### Variables de Entorno Requeridas

```env
OPENAI_API_KEY=tu_clave_de_openai
```

### Configuración de Modelos

Los modelos se configuran en `config.ts`:

```typescript
export const AIConfig = {
  models: {
    default: "gpt-4o-mini", // Para contenido general
    creative: "gpt-4o", // Para contenido creativo
    fast: "gpt-3.5-turbo" // Para respuestas rápidas
  },
  temperature: {
    creative: 0.8, // Más creativo
    balanced: 0.7, // Balanceado
    precise: 0.3, // Más preciso
    analytical: 0.1 // Muy preciso
  }
};
```

## Validación

Todos los datos se validan usando esquemas de Zod definidos en `schemas.ts`:

- `GeneratedContentSchema` - Para contenido generado
- `PlacementAnalysisSchema` - Para análisis de prueba de nivelación
- `LearningPathSchema` - Para planes de aprendizaje
- `ExerciseSchema` - Para ejercicios
- `CodeExampleSchema` - Para ejemplos de código

## Manejo de Errores

El sistema incluye manejo robusto de errores:

1. **Validación de entrada** - Todos los datos se validan antes del procesamiento
2. **Retry automático** - Reintentos automáticos para fallos de API
3. **Fallback** - Si falla la IA, se usa contenido predefinido
4. **Logging** - Errores detallados para debugging

## Mejores Prácticas

1. **Usar tipos TypeScript** - Siempre usar los tipos definidos en `schemas.ts`
2. **Validar respuestas** - Validar siempre las respuestas de la IA
3. **Manejar errores** - Implementar manejo de errores apropiado
4. **Cachear contenido** - Cachear contenido generado para mejorar performance
5. **Monitorear uso** - Monitorear el uso de la API para controlar costos

## Extensibilidad

El sistema está diseñado para ser extensible:

1. **Nuevos modelos** - Fácil agregar nuevos modelos de IA
2. **Nuevos tipos de contenido** - Agregar nuevos esquemas de validación
3. **Nuevos servicios** - Crear servicios especializados
4. **Nuevos endpoints** - Agregar nuevos endpoints API

## Troubleshooting

### Error: "OPENAI_API_KEY no está configurada"

- Verificar que la variable de entorno esté configurada
- Reiniciar el servidor después de configurar la variable

### Error: "Error al generar contenido educativo"

- Verificar la conexión a internet
- Verificar que la API key sea válida
- Revisar los logs para más detalles

### Error: "Datos inválidos"

- Verificar que todos los campos requeridos estén presentes
- Verificar que los tipos de datos sean correctos
- Revisar los esquemas de validación en `schemas.ts`
