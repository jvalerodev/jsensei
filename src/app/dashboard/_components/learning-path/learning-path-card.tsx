import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { LearningPathItem } from "./learning-path-item";
import { getTopicStatus } from "@/lib/services";
import type { LearningPath } from "@/lib/ai/schemas";

type LearningPathCardProps = {
  learningPath: LearningPath | null;
  completedTopicIds: string[];
  userLevel?: string;
  userId: string;
};

export function LearningPathCard({
  learningPath,
  completedTopicIds
}: LearningPathCardProps) {
  if (!learningPath) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Tu Ruta de Aprendizaje
          </CardTitle>
          <CardDescription>
            No se encontró un plan de aprendizaje personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">
              Aún no tienes un plan de aprendizaje generado.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          {learningPath.title}
        </CardTitle>
        <CardDescription>{learningPath.description}</CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">
            {learningPath.estimatedDuration}h estimadas
          </Badge>
          <Badge variant="secondary">
            {learningPath.topics.length} módulos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {learningPath.topics.map((topic, index) => {
            // Generate topic ID if not present
            const topicId =
              (topic as any).id || `${learningPath.id}_topic_${index}`;

            // Get all topic IDs for sequential learning logic
            const allTopicIds = learningPath.topics.map(
              (t, i) => (t as any).id || `${learningPath.id}_topic_${i}`
            );

            // Determine topic status based on completed IDs and sequential learning
            const { isCompleted, isCurrent, isLocked } = getTopicStatus(
              topicId,
              index,
              completedTopicIds,
              allTopicIds
            );

            return (
              <LearningPathItem
                key={`${topic.title}-${index}`}
                topic={{
                  ...topic,
                  id: topicId
                }}
                index={index}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked}
                learningPathId={learningPath.id}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

