import { Button } from "@/components/ui/button";
import { Question, UserAnswer } from "../types";

type NavigationProps = {
  currentQuestionIndex: number;
  questions: Question[];
  userAnswers: UserAnswer[];
  selectedAnswer: string;
  isSubmitting: boolean;
  isGeneratingContent: boolean;
  handleNextQuestion: () => void;
};

export function Navigation({
  currentQuestionIndex,
  questions,
  userAnswers,
  selectedAnswer,
  isSubmitting,
  isGeneratingContent,
  handleNextQuestion
}: NavigationProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {userAnswers.length > 0 && (
          <span>
            Correctas hasta ahora:{" "}
            {userAnswers.filter((a) => a.isCorrect).length}/{userAnswers.length}
          </span>
        )}
      </div>
      <Button
        onClick={handleNextQuestion}
        disabled={!selectedAnswer || isSubmitting || isGeneratingContent}
        className="bg-blue-600 hover:bg-blue-700 px-8 cursor-pointer"
      >
        {isGeneratingContent
          ? "🤖 Generando contenido personalizado..."
          : isSubmitting
          ? "Procesando..."
          : currentQuestionIndex === questions.length - 1
          ? "Finalizar Test"
          : "Siguiente"}
      </Button>
    </div>
  );
}
