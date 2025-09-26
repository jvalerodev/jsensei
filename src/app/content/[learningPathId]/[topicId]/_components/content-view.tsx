"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTopicContent } from "@/hooks/use-topic-content";
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
  const { toast } = useToast();
  const [topicData, setTopicData] = useState<TopicContentData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        } else {
          setError("No se pudo cargar el contenido del topic");
        }
      } catch (err) {
        console.error("Error loading topic content:", err);
        setError("Error al cargar el contenido del topic");
      }
    };

    loadTopicContent();
  }, [learningPathId, topicId, generateTopicContent, toast]);

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleMarkAsCompleted = () => {
    // TODO: Implementar funcionalidad para marcar como completado
    toast({
      title: "Funcionalidad pendiente",
      description: "Esta funcionalidad será implementada próximamente"
    });
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
  const exercise = content.find((c) => c.content_type === "exercise");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <TopicHeader
        topic={topic}
        learningPathTitle={learningPath.title}
        onBackToDashboard={handleBackToDashboard}
      />

      {lesson && <LessonContent lesson={lesson} />}

      {exercise &&
        exercise.content?.exercises &&
        exercise.content.exercises.length > 0 && (
          <ExerciseSection exercises={exercise.content.exercises} />
        )}

      <ActionButtons
        onBackToDashboard={handleBackToDashboard}
        onMarkAsCompleted={handleMarkAsCompleted}
      />
    </div>
  );
}
