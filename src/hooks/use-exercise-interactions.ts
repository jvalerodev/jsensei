import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export type SavedExerciseAnswer = {
  userAnswer: string;
  isCorrect: boolean;
  timestamp: string;
  attemptNumber: number;
  maxAttemptsReached: boolean;
  isCompleted: boolean;
  aiFeedback?: string;
  aiSuggestions?: string[];
};

export type ExerciseAnswersMap = Record<string, SavedExerciseAnswer>;

export function useExerciseInteractions(contentId: string) {
  const [savedAnswers, setSavedAnswers] = useState<ExerciseAnswersMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load saved answers on mount - will be called per exercise
  // Since each exercise loads its own answers, this is fine
  useEffect(() => {
    // Don't auto-load on mount, answers will be loaded on-demand
    // via getSavedAnswer when each exercise component mounts
    setIsLoading(false);
  }, [contentId]);

  // Save exercise answer with AI feedback support
  const saveAnswer = useCallback(
    async (
      exerciseId: string,
      userAnswer: string,
      correctAnswer: string,
      isCorrect: boolean,
      exerciseType: string,
      exerciseQuestion?: string
    ): Promise<{
      success: boolean;
      attemptNumber?: number;
      maxAttemptsReached?: boolean;
      aiFeedback?: string;
      aiSuggestions?: string[];
      relatedConcepts?: string[];
    }> => {
      try {
        const response = await fetch("/api/exercises/interactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contentId,
            exerciseId,
            userAnswer,
            correctAnswer,
            isCorrect,
            exerciseType,
            exerciseQuestion
          })
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle max attempts reached
          if (result.maxAttemptsReached) {
            toast({
              title: "Máximo de intentos alcanzado",
              description:
                "Ya has usado todos tus intentos para este ejercicio.",
              variant: "destructive"
            });
          }
          return {
            success: false,
            maxAttemptsReached: result.maxAttemptsReached,
            attemptNumber: result.attemptNumber
          };
        }

        if (result.success) {
          // Update local state
          setSavedAnswers((prev) => ({
            ...prev,
            [exerciseId]: {
              userAnswer,
              isCorrect,
              timestamp: new Date().toISOString(),
              attemptNumber: result.attemptNumber,
              maxAttemptsReached: result.maxAttemptsReached,
              isCompleted: isCorrect,
              aiFeedback: result.aiFeedback,
              aiSuggestions: result.aiSuggestions
            }
          }));

          console.log(
            `[useExerciseInteractions] Saved answer for ${exerciseId} (Attempt ${result.attemptNumber})`
          );

          return {
            success: true,
            attemptNumber: result.attemptNumber,
            maxAttemptsReached: result.maxAttemptsReached,
            aiFeedback: result.aiFeedback,
            aiSuggestions: result.aiSuggestions,
            relatedConcepts: result.relatedConcepts
          };
        }

        return { success: false };
      } catch (error) {
        console.error("[useExerciseInteractions] Error saving answer:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar tu respuesta. Intenta de nuevo.",
          variant: "destructive"
        });
        return { success: false };
      }
    },
    [contentId, toast]
  );

  // Load saved answer for specific exercise (lazy loading)
  const loadSavedAnswer = useCallback(
    async (exerciseId: string): Promise<SavedExerciseAnswer | null> => {
      // Check if already loaded
      if (savedAnswers[exerciseId]) {
        return savedAnswers[exerciseId];
      }

      try {
        const response = await fetch(
          `/api/exercises/interactions?contentId=${contentId}&exerciseId=${exerciseId}`
        );

        if (!response.ok) {
          return null;
        }

        const result = await response.json();

        if (result.success && result.data && result.data[exerciseId]) {
          const answer = result.data[exerciseId];
          // Cache the answer
          setSavedAnswers((prev) => ({
            ...prev,
            [exerciseId]: answer
          }));
          return answer;
        }

        return null;
      } catch (error) {
        console.error("[useExerciseInteractions] Error loading answer:", error);
        return null;
      }
    },
    [contentId, savedAnswers]
  );

  // Get saved answer for specific exercise (synchronous, from cache)
  const getSavedAnswer = useCallback(
    (exerciseId: string): SavedExerciseAnswer | null => {
      return savedAnswers[exerciseId] || null;
    },
    [savedAnswers]
  );

  // Check if exercise has been answered
  const hasAnswer = useCallback(
    (exerciseId: string): boolean => {
      return exerciseId in savedAnswers;
    },
    [savedAnswers]
  );

  // Regenerate exercise when max attempts reached
  const regenerateExercise = useCallback(
    async (
      exerciseType: "multiple-choice" | "code-completion" | "debugging" | "coding",
      topicTitle: string,
      topicContext: string = ""
    ): Promise<{
      success: boolean;
      newExercise?: any;
      error?: string;
    }> => {
      try {
        const response = await fetch("/api/exercises/regenerate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contentId, // contentId es el ID de la fila en contents (el ejercicio)
            exerciseType,
            topicTitle,
            topicContext
          })
        });

        const result = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: result.error || "Error al regenerar ejercicio"
          };
        }

        if (result.success) {
          // Clear all saved answers for this content (exercise)
          setSavedAnswers({});

          toast({
            title: "Ejercicio regenerado",
            description: "Se ha generado un nuevo ejercicio. ¡Sigue intentando!",
          });

          return {
            success: true,
            newExercise: result.newExercise
          };
        }

        return { success: false };
      } catch (error) {
        console.error("[useExerciseInteractions] Error regenerating exercise:", error);
        toast({
          title: "Error",
          description: "No se pudo regenerar el ejercicio. Intenta de nuevo.",
          variant: "destructive"
        });
        return {
          success: false,
          error: "Error al regenerar ejercicio"
        };
      }
    },
    [contentId, toast]
  );

  return {
    savedAnswers,
    isLoading,
    saveAnswer,
    loadSavedAnswer,
    getSavedAnswer,
    hasAnswer,
    regenerateExercise
  };
}
