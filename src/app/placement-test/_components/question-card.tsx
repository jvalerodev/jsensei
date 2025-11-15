import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Question } from "../types";

type QuestionCardProps = {
  currentQuestion: Question;
  selectedAnswer: string;
  handleAnswerSelect: (answer: string) => void;
};

export function QuestionCard({
  currentQuestion,
  selectedAnswer,
  handleAnswerSelect
}: QuestionCardProps) {
  return (
    <Card className="shadow-xl border-0 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentQuestion?.difficulty_level === "beginner"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            />
            <span className="text-sm text-gray-500 capitalize">
              {currentQuestion?.difficulty_level === "beginner"
                ? "Principiante"
                : "Intermedio"}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {currentQuestion?.points}{" "}
            {currentQuestion?.points === 1 ? "punto" : "puntos"}
          </span>
        </div>
        <CardTitle className="text-xl leading-relaxed">
          {currentQuestion?.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
          <div className="space-y-3">
            {(Array.isArray(currentQuestion?.options)
              ? currentQuestion.options
              : []
            ).map((option: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
