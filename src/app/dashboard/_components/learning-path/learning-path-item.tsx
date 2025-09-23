"use client";
import { CheckCircle, Lock, Play, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTopicContent } from "@/hooks/use-topic-content";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type LearningPathItemProps = {
  topic: {
    id: string;
    title: string;
    objective: string;
    topics: string[];
  };
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  learningPathId?: string;
};

export function LearningPathItem({
  topic,
  index,
  isCompleted,
  isCurrent,
  isLocked,
  learningPathId
}: LearningPathItemProps) {
  const { generateTopicContent, isLoading } = useTopicContent();
  const { toast } = useToast();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleContinue = async () => {
    if (!learningPathId) {
      toast({
        title: "Error",
        description: "No se pudo identificar el learning path",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateTopicContent(learningPathId, topic.id);

      if (result) {
        toast({
          title: result.wasGenerated
            ? "Contenido generado"
            : "Contenido cargado",
          description: result.wasGenerated
            ? `Se ha generado el contenido para "${result.topic.title}"`
            : `Se ha cargado el contenido existente para "${result.topic.title}"`
        });

        // Navigate to the topic content page
        router.push(`/topic/${learningPathId}/${topic.id}`);
      } else {
        toast({
          title: "Error",
          description: "No se pudo generar el contenido del topic",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error handling continue:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el topic",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-colors",
        isCurrent
          ? "border-blue-200 bg-blue-50"
          : isCompleted
          ? "border-green-200 bg-green-50"
          : isLocked
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
            isCompleted
              ? "bg-green-600 text-white"
              : isCurrent
              ? "bg-blue-600 text-white"
              : "bg-slate-300 text-slate-600"
          )}
        >
          {isCompleted ? (
            <CheckCircle className="h-5 w-5" />
          ) : isLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            index + 1
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-900 mb-1">{topic.title}</h3>
          <p className="text-sm text-slate-600 mb-2">{topic.objective}</p>
          <div className="flex flex-wrap gap-1">
            {topic.topics.slice(0, 3).map((subtopic, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {subtopic}
              </Badge>
            ))}
            {topic.topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{topic.topics.length - 3} más
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isCompleted && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completado
          </Badge>
        )}
        {isCurrent && <Badge className="bg-blue-600">Actual</Badge>}
        {isLocked && <Badge variant="outline">Bloqueado</Badge>}
        <Button
          size="sm"
          disabled={isLocked || isGenerating || isLoading}
          className={isCurrent ? "bg-blue-600 hover:bg-blue-700" : ""}
          onClick={handleContinue}
        >
          {isGenerating || isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Generando...
            </>
          ) : isCurrent ? (
            <>
              <Play className="h-4 w-4 mr-1" />
              Continuar
            </>
          ) : isCompleted ? (
            "Revisar"
          ) : (
            "Comenzar"
          )}
        </Button>
      </div>
    </div>
  );
}
