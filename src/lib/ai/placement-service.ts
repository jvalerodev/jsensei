// Placement Test Service - Handles test evaluation and personalized content generation
import { createClient } from "@/lib/supabase/client";

export interface PlacementResult {
  skillLevel: "beginner" | "intermediate";
  totalScore: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedTopics: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  topics: LearningTopic[];
  estimatedDuration: number; // in hours
}

export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate";
  prerequisite?: string[];
  estimatedTime: number; // in minutes
  content: {
    explanation: string;
    examples: CodeExample[];
    exercises: Exercise[];
  };
}

export interface CodeExample {
  title: string;
  code: string;
  explanation: string;
}

export interface Exercise {
  id: string;
  question: string;
  type: "multiple-choice" | "code-completion" | "debugging" | "coding";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "beginner" | "intermediate";
}

export class PlacementService {
  private supabase = createClient();

  /**
   * Evaluate placement test responses and determine user skill level
   */
  async evaluatePlacementTest(
    userId: string,
    responses: Array<{
      questionId: string;
      selectedAnswer: string;
      responseTime: number;
    }>
  ): Promise<PlacementResult> {
    // Get questions with their details
    const { data: questions } = await this.supabase
      .from("placement_questions")
      .select("*")
      .in(
        "id",
        responses.map((r) => r.questionId)
      );

    if (!questions) throw new Error("Failed to load questions");

    // Calculate results
    let totalScore = 0;
    let correctAnswers = 0;
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];
    const difficultyPerformance = {
      beginner: { correct: 0, total: 0 },
      intermediate: { correct: 0, total: 0 },
      advanced: { correct: 0, total: 0 }
    };

    responses.forEach((response) => {
      const question = questions.find((q) => q.id === response.questionId);
      if (!question) return;

      const isCorrect = response.selectedAnswer === question.correct_answer;
      if (isCorrect) {
        totalScore += question.points;
        correctAnswers++;
      }

      // Track performance by difficulty
      const level =
        question.difficulty_level as keyof typeof difficultyPerformance;
      difficultyPerformance[level].total++;
      if (isCorrect) {
        difficultyPerformance[level].correct++;
      }
    });

    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (totalScore / maxScore) * 100;

    // Determine skill level with more nuanced logic
    let skillLevel: "beginner" | "intermediate" = "beginner";

    if (percentage >= 45) {
      skillLevel = "intermediate";
    }

    // Analyze weak and strong areas
    Object.entries(difficultyPerformance).forEach(([level, performance]) => {
      const successRate =
        performance.total > 0 ? performance.correct / performance.total : 0;
      if (successRate < 0.5 && performance.total > 0) {
        weakAreas.push(level);
      } else if (successRate >= 0.8) {
        strongAreas.push(level);
      }
    });

    const recommendedTopics = this.getRecommendedTopics(skillLevel, weakAreas);

    return {
      skillLevel,
      totalScore,
      maxScore,
      correctAnswers,
      totalQuestions: responses.length,
      weakAreas,
      strongAreas,
      recommendedTopics
    };
  }

  /**
   * Generate personalized learning path based on placement test results
   */
  async generatePersonalizedLearningPath(
    result: PlacementResult
  ): Promise<LearningPath> {
    const topics = await this.generateTopicsForLevel(
      result.skillLevel,
      result.weakAreas
    );

    return {
      id: `path-${result.skillLevel}-${Date.now()}`,
      title: `JavaScript ${this.getLevelName(result.skillLevel)}`,
      description: this.getPathDescription(result),
      topics,
      estimatedDuration:
        topics.reduce((sum, topic) => sum + topic.estimatedTime, 0) / 60
    };
  }

  /**
   * Generate topics based on skill level and weak areas
   */
  private async generateTopicsForLevel(
    level: "beginner" | "intermediate",
    weakAreas: string[]
  ): Promise<LearningTopic[]> {
    const topicTemplates = this.getTopicTemplates(level);

    // Prioritize topics based on weak areas
    const prioritizedTopics = topicTemplates.sort((a, b) => {
      const aIsWeak = weakAreas.includes(a.difficulty);
      const bIsWeak = weakAreas.includes(b.difficulty);
      if (aIsWeak && !bIsWeak) return -1;
      if (!aIsWeak && bIsWeak) return 1;
      return 0;
    });

    return prioritizedTopics.map((template) => ({
      ...template,
      content: this.generateTopicContent(template)
    }));
  }

  /**
   * Get topic templates based on skill level
   */
  private getTopicTemplates(
    level: "beginner" | "intermediate"
  ): Omit<LearningTopic, "content">[] {
    const templates = {
      beginner: [
        {
          id: "variables-modern",
          title: "Variables Modernas (let, const)",
          description:
            "Aprende las mejores prácticas para declarar variables en JavaScript moderno",
          difficulty: "beginner" as const,
          estimatedTime: 30
        },
        {
          id: "arrow-functions",
          title: "Funciones Arrow",
          description:
            "Domina la sintaxis moderna de funciones y sus diferencias",
          difficulty: "beginner" as const,
          estimatedTime: 25
        },
        {
          id: "template-literals",
          title: "Template Literals",
          description: "Crea strings dinámicos de forma elegante",
          difficulty: "beginner" as const,
          estimatedTime: 20
        },
        {
          id: "destructuring-basics",
          title: "Destructuring Básico",
          description: "Extrae datos de objetos y arrays eficientemente",
          difficulty: "beginner" as const,
          estimatedTime: 35
        },
        {
          id: "arrays-objects",
          title: "Arrays y Objetos",
          description: "Manipulación básica de estructuras de datos",
          difficulty: "beginner" as const,
          estimatedTime: 40
        }
      ],
      intermediate: [
        {
          id: "async-await",
          title: "Async/Await",
          description: "Maneja código asíncrono de forma clara y legible",
          difficulty: "intermediate" as const,
          estimatedTime: 45
        },
        {
          id: "promises-basics",
          title: "Promesas Básicas",
          description: "Promise.all, Promise.race, y manejo de errores",
          difficulty: "intermediate" as const,
          estimatedTime: 40
        },
        {
          id: "array-methods",
          title: "Métodos de Array Modernos",
          description: "map, filter, reduce, find y más",
          difficulty: "intermediate" as const,
          estimatedTime: 50
        },
        {
          id: "es6-modules",
          title: "Módulos ES6",
          description: "Import/export y organización de código",
          difficulty: "intermediate" as const,
          estimatedTime: 35
        },
        {
          id: "closures-basics",
          title: "Closures Básicas",
          description: "Entiende el scope y las closures en JavaScript",
          difficulty: "intermediate" as const,
          estimatedTime: 45
        },
        {
          id: "error-handling",
          title: "Manejo de Errores",
          description: "try/catch, throw y mejores prácticas",
          difficulty: "intermediate" as const,
          estimatedTime: 30
        }
      ]
    };

    return templates[level] || templates.beginner;
  }

  /**
   * Generate content for a specific topic
   */
  private generateTopicContent(
    template: Omit<LearningTopic, "content">
  ): LearningTopic["content"] {
    // This would be replaced with actual AI generation
    const mockContent = {
      "variables-modern": {
        explanation: `# Variables Modernas en JavaScript

En JavaScript moderno, tenemos tres formas de declarar variables:

## let
- **Scope de bloque**: Solo existe dentro del bloque donde se declara
- **Reasignable**: Puedes cambiar su valor
- **No hoisting problemático**: No se puede usar antes de declararse

\`\`\`javascript
let nombre = "Ana";
nombre = "Luis"; // ✅ Permitido
\`\`\`

## const
- **Scope de bloque**: Como let
- **No reasignable**: No puedes cambiar la referencia
- **Debe inicializarse**: Requiere valor al declararse

\`\`\`javascript
const PI = 3.14159;
// PI = 3.14; // ❌ Error!
\`\`\`

## ¿Cuándo usar cada una?
- **const**: Por defecto, para valores que no cambiarán
- **let**: Cuando necesites reasignar la variable
- **var**: Evítala en código moderno`,
        examples: [
          {
            title: "Scope de bloque con let",
            code: `if (true) {
  let mensaje = "Solo visible aquí";
  console.log(mensaje); // ✅ Funciona
}
// console.log(mensaje); // ❌ Error: mensaje no está definido`,
            explanation:
              "let tiene scope de bloque, por lo que no es accesible fuera del if"
          },
          {
            title: "const con objetos",
            code: `const usuario = { nombre: "Ana", edad: 25 };
usuario.edad = 26; // ✅ Permitido (modifica contenido)
// usuario = {}; // ❌ Error (reasignación)`,
            explanation:
              "const previene reasignación, pero permite modificar el contenido de objetos"
          }
        ],
        exercises: [
          {
            id: "var-let-const-1",
            question:
              "¿Cuál es la mejor práctica para declarar una variable que almacenará la edad de un usuario y podría cambiar?",
            type: "multiple-choice" as const,
            options: [
              "var edad = 25",
              "let edad = 25",
              "const edad = 25",
              "age = 25"
            ],
            correctAnswer: "let edad = 25",
            explanation:
              "Usa let para variables que pueden cambiar, const para constantes.",
            difficulty: "beginner" as const
          }
        ]
      }
    };

    return (
      mockContent[template.id as keyof typeof mockContent] || {
        explanation: `Contenido generado para ${template.title}`,
        examples: [],
        exercises: []
      }
    );
  }

  /**
   * Get recommended topics based on skill level and weak areas
   */
  private getRecommendedTopics(
    level: "beginner" | "intermediate",
    weakAreas: string[]
  ): string[] {
    const recommendations = {
      beginner: [
        "Variables y Scope",
        "Funciones Arrow",
        "Template Literals",
        "Destructuring Básico",
        "Arrays y Objetos"
      ],
      intermediate: [
        "Async/Await",
        "Promises",
        "Array Methods",
        "ES6 Modules",
        "Error Handling",
        "Closures Básicas"
      ]
    };

    return recommendations[level];
  }

  /**
   * Get human-readable level name
   */
  private getLevelName(level: "beginner" | "intermediate"): string {
    const names = {
      beginner: "Principiante",
      intermediate: "Intermedio"
    };
    return names[level];
  }

  /**
   * Generate path description based on results
   */
  private getPathDescription(result: PlacementResult): string {
    const levelName = this.getLevelName(result.skillLevel);
    const percentage = Math.round(
      (result.correctAnswers / result.totalQuestions) * 100
    );

    let description = `Basado en tu test de nivelación (${percentage}% de aciertos), hemos creado un plan de aprendizaje personalizado para nivel ${levelName}.`;

    if (result.weakAreas.length > 0) {
      description += ` Nos enfocaremos especialmente en fortalecer las áreas donde necesitas más práctica.`;
    }

    if (result.strongAreas.length > 0) {
      description += ` También aprovecharemos tus fortalezas existentes para acelerar tu progreso.`;
    }

    return description;
  }

  /**
   * Save placement test results and generate initial content
   */
  async completeUserPlacement(
    userId: string,
    result: PlacementResult
  ): Promise<{ success: boolean; learningPath?: LearningPath }> {
    try {
      // Update user profile with test results
      const { error: profileError } = await this.supabase
        .from("users")
        .update({
          placement_test_completed: true,
          placement_test_score: result.totalScore,
          skill_level: result.skillLevel,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Generate personalized learning path
      const learningPath = await this.generatePersonalizedLearningPath(result);

      // Generate initial lessons based on the learning path
      await this.generateInitialLessons(userId, learningPath);

      return { success: true, learningPath };
    } catch (error) {
      console.error("Error completing user placement:", error);
      return { success: false };
    }
  }

  /**
   * Generate initial lessons for the user
   */
  private async generateInitialLessons(
    userId: string,
    learningPath: LearningPath
  ): Promise<void> {
    const lessonsToCreate = learningPath.topics.slice(0, 3); // Start with first 3 topics

    for (let i = 0; i < lessonsToCreate.length; i++) {
      const topic = lessonsToCreate[i];

      const lessonContent = {
        type: "lesson",
        explanation: topic.content.explanation,
        examples: topic.content.examples,
        exercises: topic.content.exercises,
        estimatedTime: topic.estimatedTime
      };

      await this.supabase.from("lessons").insert({
        title: topic.title,
        description: topic.description,
        content: lessonContent,
        difficulty_level: topic.difficulty,
        order_index: i + 1,
        estimated_duration: topic.estimatedTime
      });
    }
  }

  /**
   * Get user's current skill level and progress
   */
  async getUserSkillLevel(userId: string): Promise<{
    skillLevel: string;
    placementCompleted: boolean;
    testScore?: number;
  }> {
    const { data: profile } = await this.supabase
      .from("users")
      .select("skill_level, placement_test_completed, placement_test_score")
      .eq("id", userId)
      .single();

    return {
      skillLevel: profile?.skill_level || "beginner",
      placementCompleted: profile?.placement_test_completed || false,
      testScore: profile?.placement_test_score
    };
  }

  /**
   * Generate adaptive content based on user performance
   */
  async generateAdaptiveContent(
    userId: string,
    topic: string,
    userPerformance: {
      recentScores: number[];
      timeSpent: number;
      strugglingAreas: string[];
    }
  ): Promise<LearningTopic> {
    // This would integrate with AI to generate personalized content
    // For now, return a mock topic
    return {
      id: `adaptive-${topic}-${Date.now()}`,
      title: `${topic} - Contenido Adaptativo`,
      description: "Contenido personalizado basado en tu progreso",
      difficulty: "intermediate",
      estimatedTime: 30,
      content: {
        explanation: `Contenido adaptativo para ${topic} basado en tu rendimiento actual.`,
        examples: [],
        exercises: []
      }
    };
  }
}

export const placementService = new PlacementService();
