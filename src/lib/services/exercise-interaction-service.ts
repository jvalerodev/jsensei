import { createServerDatabase } from "@/lib/database/server";
import { ExerciseFeedbackAIService } from "@/lib/ai/exercise-feedback-ai-service";
import { CodeEvaluationAIService } from "@/lib/ai/code-evaluation-ai-service";
import type { UserInteraction } from "@/lib/database/types";

const MAX_ATTEMPTS = 3;

/**
 * Service for managing exercise interactions
 * Handles saving and retrieving user answers with AI feedback for multiple attempts
 */
export class ExerciseInteractionService {
  /**
   * Save user's exercise answer with AI feedback support
   * For "coding" exercises, AI evaluates the code and determines correctness
   */
  static async saveExerciseAnswer(
    userId: string,
    contentId: string,
    exerciseId: string,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    exerciseType: string,
    exerciseQuestion?: string,
    userSkillLevel?: "beginner" | "intermediate",
    evaluationCriteria?: string
  ): Promise<{
    success: boolean;
    attemptNumber: number;
    maxAttemptsReached: boolean;
    aiFeedback?: string;
    aiSuggestions?: string[];
    relatedConcepts?: string[];
    isCorrect?: boolean; // Return evaluated isCorrect for coding exercises
    score?: number; // Return score for coding exercises
  }> {
    const db = await createServerDatabase();

    // Get current attempt count
    const attemptCount = await db.userInteractions.getExerciseAttemptCount(
      userId,
      contentId
    );
    const attemptNumber = attemptCount + 1;

    // Check if already completed
    const isCompleted = await db.userInteractions.isExerciseCompleted(
      userId,
      contentId
    );

    if (isCompleted) {
      // Exercise already completed correctly, don't allow more attempts
      return {
        success: false,
        attemptNumber: attemptCount,
        maxAttemptsReached: true
      };
    }

    // Check if max attempts reached
    if (attemptCount >= MAX_ATTEMPTS) {
      return {
        success: false,
        attemptNumber: attemptCount,
        maxAttemptsReached: true
      };
    }

    let aiFeedback: string | undefined;
    let aiSuggestions: string[] | undefined;
    let relatedConcepts: string[] | undefined;
    let evaluatedIsCorrect = isCorrect;
    let score = isCorrect ? 100 : 0;

    // Special handling for "coding" exercises - AI evaluates the code
    if (exerciseType === "coding" && exerciseQuestion) {
      try {
        console.log(`[ExerciseInteractionService] Evaluating coding exercise with AI...`);
        
        const evaluation = await CodeEvaluationAIService.evaluateCode(
          exerciseQuestion,
          userAnswer,
          attemptNumber,
          userSkillLevel || "beginner",
          evaluationCriteria
        );

        // AI determines if the code is correct
        evaluatedIsCorrect = evaluation.isPassing;
        score = evaluation.score;
        aiFeedback = evaluation.feedback;
        aiSuggestions = evaluation.suggestions;

        console.log(
          `[ExerciseInteractionService] AI Evaluation - Passing: ${evaluatedIsCorrect}, Score: ${score}`
        );
      } catch (error) {
        console.error("[ExerciseInteractionService] Error evaluating code with AI:", error);
        // If AI fails, treat as incorrect and continue
        evaluatedIsCorrect = false;
        score = 0;
        aiFeedback = "Error al evaluar el código. Por favor, intenta de nuevo.";
      }
    } 
    // For other exercise types, generate feedback only if incorrect
    else if (!isCorrect && exerciseQuestion && attemptNumber < MAX_ATTEMPTS) {
      try {
        const feedback = await ExerciseFeedbackAIService.generateFeedback(
          exerciseQuestion,
          exerciseType,
          userAnswer,
          correctAnswer,
          attemptNumber,
          userSkillLevel || "beginner"
        );

        aiFeedback = feedback.feedback;
        aiSuggestions = feedback.hints;
        relatedConcepts = feedback.relatedConcepts;
      } catch (error) {
        console.error("[ExerciseInteractionService] Error generating feedback:", error);
        // Continue without feedback rather than failing
      }
    }

    // Save the interaction with evaluated correctness
    await db.userInteractions.recordExerciseAnswer(
      userId,
      contentId,
      userAnswer,
      correctAnswer,
      evaluatedIsCorrect, // Use AI-evaluated correctness for coding exercises
      score,
      aiFeedback,
      aiSuggestions,
      undefined // No AI explanation, use exercise.explanation instead
    );

    return {
      success: true,
      attemptNumber,
      maxAttemptsReached: attemptNumber >= MAX_ATTEMPTS,
      aiFeedback,
      aiSuggestions,
      relatedConcepts,
      isCorrect: evaluatedIsCorrect, // Return evaluated correctness
      score
    };
  }

  /**
   * Get user's exercise status including all attempts
   */
  static async getExerciseAnswer(
    userId: string,
    contentId: string,
    exerciseId: string
  ): Promise<{
    userAnswer: string;
    isCorrect: boolean;
    timestamp: string;
    attemptNumber: number;
    maxAttemptsReached: boolean;
    isCompleted: boolean;
    aiFeedback?: string;
    aiSuggestions?: string[];
    aiExplanation?: string;
    allAttempts?: UserInteraction[];
  } | null> {
    const db = await createServerDatabase();

    // Get all attempts
    const attempts = await db.userInteractions.getExerciseAttempts(
      userId,
      contentId
    );

    if (attempts.length === 0) {
      return null;
    }

    // Get latest attempt
    const latestAttempt = attempts[attempts.length - 1];
    
    // Check if completed (any correct answer)
    const isCompleted = attempts.some(attempt => attempt.is_correct === true);

    return {
      userAnswer: latestAttempt.user_answer || "",
      isCorrect: latestAttempt.is_correct || false,
      timestamp: latestAttempt.created_at,
      attemptNumber: attempts.length,
      maxAttemptsReached: attempts.length >= MAX_ATTEMPTS,
      isCompleted,
      aiFeedback: latestAttempt.ai_feedback || undefined,
      aiSuggestions: latestAttempt.ai_suggestions || undefined,
      aiExplanation: latestAttempt.ai_explanation || undefined,
      allAttempts: attempts
    };
  }

  /**
   * Get all exercise answers for a content (compatibility method)
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
        attemptNumber: number;
        maxAttemptsReached: boolean;
        isCompleted: boolean;
      }
    >
  > {
    const exerciseData = await this.getExerciseAnswer(userId, contentId, exerciseId);

    if (!exerciseData) {
      return {};
    }

    // Return using exerciseId as key for compatibility
    return {
      [exerciseId]: {
        userAnswer: exerciseData.userAnswer,
        isCorrect: exerciseData.isCorrect,
        timestamp: exerciseData.timestamp,
        attemptNumber: exerciseData.attemptNumber,
        maxAttemptsReached: exerciseData.maxAttemptsReached,
        isCompleted: exerciseData.isCompleted
      }
    };
  }
}
