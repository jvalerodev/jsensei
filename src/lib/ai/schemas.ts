import { z } from "zod";

// Esquemas para validación de respuestas de IA
export const CodeExampleSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  code: z.string().min(1, "El código es requerido"),
  explanation: z.string().min(1, "La explicación es requerida")
});

export const ExerciseSchema = z.object({
  id: z.string().min(1, "El ID es requerido"),
  question: z.string().min(1, "La pregunta es requerida"),
  type: z.enum(["multiple-choice", "code-completion", "debugging", "coding"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(), // Opcional para ejercicios tipo 'coding'
  explanation: z.string().min(1, "La explicación es requerida"),
  difficulty: z.enum(["beginner", "intermediate"])
});

// Esquema simplificado para ejercicios sin ID (para el modelo)
// Para ejercicios tipo 'coding', correctAnswer es opcional (hay múltiples soluciones)
export const SimpleExerciseSchema = z.object({
  question: z.string().min(1, "La pregunta es requerida"),
  type: z.enum(["multiple-choice", "code-completion", "debugging", "coding"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(), // Opcional para ejercicios tipo 'coding'
  explanation: z.string().min(1, "La explicación es requerida"),
  difficulty: z.enum(["beginner", "intermediate"])
});

export const GeneratedContentSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  examples: z.array(CodeExampleSchema).optional(),
  exercises: z.array(ExerciseSchema).optional()
});

// Esquema simplificado para contenido generado sin IDs (para el modelo)
export const SimpleGeneratedContentSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  examples: z.array(CodeExampleSchema).optional(),
  exercises: z.array(SimpleExerciseSchema).optional()
});

export const PlacementAnalysisSchema = z.object({
  skillLevel: z.enum(["beginner", "intermediate"]),
  weakAreas: z.array(z.string()),
  strongAreas: z.array(z.string()),
  recommendedTopics: z.array(z.string()),
  personalizedAdvice: z.string()
});

// Esquema simplificado y conciso para la generación de learning path
export const LearningPathSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  topics: z.array(
    z.object({
      title: z.string(),
      objective: z.string(), // Objetivo específico del módulo
      topics: z.array(z.string()) // Lista de tópicos que se tratarán
    })
  ),
  estimatedDuration: z.number()
});

// Esquema simplificado para la generación de IA (sin IDs) - DEPRECATED
export const SimpleLearningPathSchema = z.object({
  title: z.string(),
  description: z.string(),
  topics: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      difficulty: z.enum(["beginner", "intermediate"]),
      estimatedTime: z.number(),
      content: z.object({
        title: z.string(),
        content: z.string(),
        examples: z
          .array(
            z.object({
              title: z.string(),
              code: z.string(),
              explanation: z.string()
            })
          )
          .optional()
          .default([]),
        exercises: z.array(SimpleExerciseSchema).optional().default([])
      })
    })
  ),
  estimatedDuration: z.number()
});

// Tipos TypeScript derivados de los esquemas
export type CodeExample = z.infer<typeof CodeExampleSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type SimpleExercise = z.infer<typeof SimpleExerciseSchema>;
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;
export type SimpleGeneratedContent = z.infer<
  typeof SimpleGeneratedContentSchema
>;
export type PlacementAnalysis = z.infer<typeof PlacementAnalysisSchema>;
export type LearningPath = z.infer<typeof LearningPathSchema>;
export type SimpleLearningPath = z.infer<typeof SimpleLearningPathSchema>;

// Interfaces para datos de entrada
export interface PlacementTestData {
  userId: string;
  responses: Array<{
    questionId: string;
    selectedAnswer: string;
    responseTime: number;
    isCorrect: boolean;
  }>;
  questions: Array<{
    id: string;
    question: string;
    correct_answer: string;
    difficulty_level: string;
    topic: string;
    points: number;
  }>;
  // Campos opcionales - la IA los calculará si no se proporcionan
  totalScore?: number;
  maxScore?: number;
  skillLevel?: "beginner" | "intermediate";
  weakAreas?: string[];
  strongAreas?: string[];
  testDuration: number;
  completedAt: string;
}

export interface ContentGenerationRequest {
  topic: string;
  skillLevel: "beginner" | "intermediate";
  weakAreas: string[];
  strongAreas: string[];
  previousContent?: GeneratedContent;
  focusAreas?: string[];
}
