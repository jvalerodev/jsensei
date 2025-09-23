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
import type { LearningPath } from "@/lib/ai/schemas";

type LearningPathCardProps = {
  learningPath: LearningPath | null;
  completedTopics?: number;
  userLevel?: string;
  userId: string;
};

export function LearningPathCard({
  learningPath,
  completedTopics = 0
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
            const isCompleted = index < completedTopics;
            const isCurrent = index === completedTopics;
            const isLocked = index > completedTopics;

            return (
              <LearningPathItem
                key={`${topic.title}-${index}`}
                topic={{
                  ...topic,
                  id: (topic as any).id || `${learningPath.id}_topic_${index}` // Generate ID if not present
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

