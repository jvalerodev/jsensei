import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

type TopicHeaderProps = {
  topic: {
    id: string;
    title: string;
    objective: string;
    topics: string[];
  };
  learningPathTitle: string;
  onBackToDashboard: () => void;
  isCompleted?: boolean;
};

export function TopicHeader({
  topic,
  learningPathTitle,
  onBackToDashboard,
  isCompleted = false
}: TopicHeaderProps) {
  return (
    <>
      {isCompleted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-green-800 font-semibold">Topic Completado</p>
            <p className="text-green-700 text-sm">
              Has completado todos los ejercicios de este módulo
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <Button
          size="sm"
          variant="outline"
          onClick={onBackToDashboard}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
          <p className="text-slate-600">{learningPathTitle}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Objetivo del Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 mb-4">{topic.objective}</p>
          <div className="flex flex-wrap gap-2">
            {topic.topics.map((subtopic, index) => (
              <Badge key={index} variant="secondary">
                {subtopic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
