import { createServerDatabase } from "@/lib/database/server";

/**
 * Service for managing exercise interactions
 * Handles saving and retrieving user answers for all exercise types
 */
export class ExerciseInteractionService {
  /**
   * Save user's exercise answer
   */
  static async saveExerciseAnswer(
    userId: string,
    contentId: string,
    exerciseId: string,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    exerciseType: string
  ): Promise<void> {
    const db = await createServerDatabase();

    // Save the answer - each content item is a separate exercise
    // so we only store the user's answer as a simple string
    await db.userInteractions.recordExerciseAnswer(
      userId,
      contentId,
      userAnswer, // Store only the user's answer
      correctAnswer,
      isCorrect,
      isCorrect ? 100 : 0 // Simple scoring: 100 for correct, 0 for incorrect
    );
  }

  /**
   * Get user's previous answer for a specific exercise
   */
  static async getExerciseAnswer(
    userId: string,
    contentId: string,
    exerciseId: string
  ): Promise<{
    userAnswer: string;
    isCorrect: boolean;
    timestamp: string;
  } | null> {
    const db = await createServerDatabase();

    // Get the latest interaction for this content
    // Since each exercise is a separate content item, we just need the latest one
    const { data: interactions } = await db.userInteractions.findAll(
      {
        user_id: userId,
        content_id: contentId,
        interaction_type: "exercise_answer"
      },
      {
        orderBy: "created_at",
        orderDirection: "desc",
        limit: 1
      }
    );

    if (!interactions || interactions.length === 0) {
      return null;
    }

    const interaction = interactions[0];
    return {
      userAnswer: interaction.user_answer || "",
      isCorrect: interaction.is_correct || false,
      timestamp: interaction.created_at
    };
  }

  /**
   * Get all exercise answers for a content
   */
  static async getAllExerciseAnswers(
    userId: string,
    contentId: string,
    exerciseId: string
  ): Promise<
    Record<
      string,
      {
        userAnswer: string;
        isCorrect: boolean;
        timestamp: string;
      }
    >
  > {
    const db = await createServerDatabase();

    // Since each exercise is a separate content item, this method
    // isn't really needed anymore, but we keep it for compatibility
    // It will just return the answer for this specific content
    const { data: interactions } = await db.userInteractions.findAll(
      {
        user_id: userId,
        content_id: contentId,
        interaction_type: "exercise_answer"
      },
      {
        orderBy: "created_at",
        orderDirection: "desc",
        limit: 1
      }
    );

    if (!interactions || interactions.length === 0) {
      return {};
    }

    const interaction = interactions[0];

    // Return using exerciseId as key for compatibility
    return {
      [exerciseId]: {
        userAnswer: interaction.user_answer || "",
        isCorrect: interaction.is_correct || false,
        timestamp: interaction.created_at
      }
    };
  }
}
