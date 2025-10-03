import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface SaveProgressParams {
  learningPathId: string;
  topicId: string;
}

interface ProgressData {
  id: string;
  score: number;
  attempts: number;
  timeSpent: number;
  status: string;
  completedAt?: string;
}

/**
 * Hook for managing topic progress
 * Handles saving progress when all exercises are completed
 */
export function useTopicProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Save progress for a topic
   * This should be called when all exercises are completed
   */
  const saveProgress = useCallback(
    async ({
      learningPathId,
      topicId
    }: SaveProgressParams): Promise<ProgressData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/progress/topic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            learningPathId,
            topicId
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error al guardar el progreso");
        }

        if (result.success) {
          toast({
            title: "¡Topic completado!",
            description: "Tu progreso ha sido guardado exitosamente.",
            variant: "default"
          });

          return result.data;
        }

        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al guardar el progreso";
        setError(errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Check if progress exists and if all exercises are completed
   */
  const checkProgress = useCallback(
    async ({
      learningPathId,
      topicId
    }: SaveProgressParams): Promise<{
      progress: ProgressData | null;
      allExercisesCompleted: boolean;
    }> => {
      try {
        const response = await fetch(
          `/api/progress/topic?learningPathId=${learningPathId}&topicId=${topicId}`
        );

        const result = await response.json();

        if (result.success) {
          return {
            progress: result.data,
            allExercisesCompleted: result.allExercisesCompleted || false
          };
        }

        return {
          progress: null,
          allExercisesCompleted: false
        };
      } catch (err) {
        console.error("[useTopicProgress] Error checking progress:", err);
        return {
          progress: null,
          allExercisesCompleted: false
        };
      }
    },
    []
  );

  return {
    saveProgress,
    checkProgress,
    isLoading,
    error
  };
}
