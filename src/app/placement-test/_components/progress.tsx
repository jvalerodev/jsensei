import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { Question } from "../types";

type ProgressInfoProps = {
  currentQuestionIndex: number;
  questions: Question[];
};

export function ProgressInfo({
  currentQuestionIndex,
  questions
}: ProgressInfoProps) {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </span>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>~15 minutos</span>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
