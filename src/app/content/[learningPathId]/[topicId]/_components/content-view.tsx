"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTopicContent } from "@/hooks/use-topic-content";
import { useTopicProgress } from "@/hooks/use-topic-progress";
import { useToast } from "@/hooks/use-toast";
import {
  TopicHeader,
  LessonContent,
  ExerciseSection,
  ActionButtons,
  ViewError,
  ViewLoading,
  ViewEmpty
} from "./view";
import type { Content } from "@/lib/database/types";

type TopicContentViewProps = {
  learningPathId: string;
  topicId: string;
};

type TopicContentData = {
  content: Content[];
  wasGenerated: boolean;
  topic: {
    id: string;
    title: string;
    objective: string;
    topics: string[];
  };
  learningPath: {
    id: string;
    title: string;
    description: string;
  };
};

export function TopicContentView({
  learningPathId,
  topicId
}: TopicContentViewProps) {
  const router = useRouter();
  const { generateTopicContent, isLoading } = useTopicContent();
  const { saveProgress, checkProgress } = useTopicProgress();
  const { toast } = useToast();
  const [topicData, setTopicData] = useState<TopicContentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressSaved, setProgressSaved] = useState(false);

  useEffect(() => {
    const loadTopicContent = async () => {
      try {
        const result = await generateTopicContent(learningPathId, topicId);
        if (result) {
          setTopicData(result);
          if (result.wasGenerated) {
            toast({
              title: "Contenido generado",
              description: `Se ha generado el contenido para "${result.topic.title}"`
            });
          }

          // Check if progress already exists
          const { progress } = await checkProgress({ learningPathId, topicId });
          if (progress) {
            setProgressSaved(true);
          }
        } else {
          setError("No se pudo cargar el contenido del topic");
        }
      } catch (err) {
        console.error("Error loading topic content:", err);
        setError("Error al cargar el contenido del topic");
      }
    };

    loadTopicContent();
  }, [learningPathId, topicId, generateTopicContent, checkProgress, toast]);

  /**
   * Check if all exercises are completed and save progress
   * This is called when exercises state changes
   */
  const handleExercisesCompleted = useCallback(async () => {
    if (progressSaved) {
      console.log("[TopicContentView] Progress already saved, skipping");
      return;
    }

    console.log("[TopicContentView] Checking if all exercises are completed");

    const { allExercisesCompleted } = await checkProgress({
      learningPathId,
      topicId
    });

    if (allExercisesCompleted) {
      console.log("[TopicContentView] All exercises completed, saving progress");
      
      const progress = await saveProgress({
        learningPathId,
        topicId
      });

      if (progress) {
        setProgressSaved(true);
      }
    }
  }, [learningPathId, topicId, saveProgress, checkProgress, progressSaved]);

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return <ViewLoading />;
  }

  if (error) {
    return <ViewError error={error} goBack={handleBackToDashboard} />;
  }

  if (!topicData) {
    return <ViewEmpty />;
  }

  const { topic, learningPath, content } = topicData;
  const lesson = content.find((c) => c.content_type === "lesson");

  // Get exercise content items and map with their contentIds
  const exerciseContentItems = content
    .filter((c) => c.content_type === "exercise")
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  // Extract exercise data with contentId mapping
  const exercises = exerciseContentItems
    .map((exerciseItem) => {
      // Extract the exercise data from the content field
      const exerciseContent = exerciseItem.content as any;
      return {
        id: exerciseContent.id || exerciseItem.id,
        contentId: exerciseItem.id, // Store the content_id for this exercise
        question: exerciseContent.question,
        type: exerciseContent.type,
        options: exerciseContent.options || [],
        correctAnswer: exerciseContent.correctAnswer,
        explanation: exerciseContent.explanation,
        difficulty: exerciseContent.difficulty
      };
    })
    .filter((ex) => ex.question); // Only include valid exercises with a question

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <TopicHeader
        topic={topic}
        learningPathTitle={learningPath.title}
        onBackToDashboard={handleBackToDashboard}
        isCompleted={progressSaved}
      />

      {lesson && <LessonContent lesson={lesson} />}

      {exercises.length > 0 && (
        <ExerciseSection 
          exercises={exercises}
          onExerciseCompleted={handleExercisesCompleted}
        />
      )}

      <ActionButtons
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
}
