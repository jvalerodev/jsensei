import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export type SavedExerciseAnswer = {
  userAnswer: string;
  isCorrect: boolean;
  timestamp: string;
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

  // Save exercise answer
  const saveAnswer = useCallback(
    async (
      exerciseId: string,
      userAnswer: string,
      correctAnswer: string,
      isCorrect: boolean,
      exerciseType: string
    ): Promise<boolean> => {
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
            exerciseType
          })
        });

        if (!response.ok) {
          throw new Error("Error al guardar respuesta");
        }

        const result = await response.json();

        if (result.success) {
          // Update local state
          setSavedAnswers(prev => ({
            ...prev,
            [exerciseId]: {
              userAnswer,
              isCorrect,
              timestamp: new Date().toISOString()
            }
          }));

          console.log(`[useExerciseInteractions] Saved answer for ${exerciseId}`);
          return true;
        }

        return false;
      } catch (error) {
        console.error("[useExerciseInteractions] Error saving answer:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar tu respuesta. Intenta de nuevo.",
          variant: "destructive"
        });
        return false;
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
          setSavedAnswers(prev => ({
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

  return {
    savedAnswers,
    isLoading,
    saveAnswer,
    loadSavedAnswer,
    getSavedAnswer,
    hasAnswer
  };
}
