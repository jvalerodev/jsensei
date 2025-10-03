"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Check, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { markdownComponents, blockMarkdownComponents } from "../markdown";
import type { TMultipleChoiceExercise } from "./exercise-types";
import { useExerciseInteractions } from "@/hooks/use-exercise-interactions";

type MultipleChoiceExerciseProps = {
  exercise: TMultipleChoiceExercise;
  index: number;
  contentId: string;
};

export function MultipleChoiceExercise({
  exercise,
  index,
  contentId
}: MultipleChoiceExerciseProps) {
  const { saveAnswer, loadSavedAnswer, isLoading } = useExerciseInteractions(contentId);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(true);

  // Load saved answer on mount
  useEffect(() => {
    const loadAnswer = async () => {
      setIsLoadingAnswer(true);
      const savedAnswer = await loadSavedAnswer(exercise.id);
      if (savedAnswer) {
        setSelectedAnswer(savedAnswer.userAnswer);
        setHasSubmitted(true);
        setShowAnswer(true);
      }
      setIsLoadingAnswer(false);
    };

    loadAnswer();
  }, [exercise.id, loadSavedAnswer]);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    const isAnswerCorrect = selectedAnswer === exercise.correctAnswer;

    setIsSaving(true);
    try {
      const success = await saveAnswer(
        exercise.id,
        selectedAnswer,
        exercise.correctAnswer,
        isAnswerCorrect,
        "multiple-choice"
      );

      if (success) {
        setHasSubmitted(true);
        setShowAnswer(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswer("");
    setHasSubmitted(false);
    setShowAnswer(false);
  };

  const isCorrect = hasSubmitted && selectedAnswer === exercise.correctAnswer;
  const isIncorrect = hasSubmitted && selectedAnswer !== exercise.correctAnswer;

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Ejercicio {index + 1}
          <Badge variant="outline" className="text-xs">
            {exercise.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Opción múltiple
          </Badge>
          {isCorrect && (
            <Badge
              variant="default"
              className="text-xs bg-green-600 text-white font-bold"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Correcto
            </Badge>
          )}
          {isIncorrect && (
            <Badge
              variant="destructive"
              className="text-xs text-white font-bold"
            >
              <X className="h-3 w-3 mr-1" />
              Incorrecto
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Question */}
        <div className="text-slate-700 mb-4">
          <ReactMarkdown components={markdownComponents}>
            {exercise.question}
          </ReactMarkdown>
        </div>

        {/* Options with Radio Buttons */}
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          disabled={hasSubmitted}
          className="space-y-3 mb-4"
        >
          {exercise.options.map((option, optIndex) => {
            const optionLetter = String.fromCharCode(65 + optIndex);
            const isThisCorrect = option === exercise.correctAnswer;
            const isThisSelected = option === selectedAnswer;

            return (
              <div
                key={optIndex}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                  hasSubmitted && isThisCorrect
                    ? "border-green-500 bg-green-50"
                    : hasSubmitted && isThisSelected && !isThisCorrect
                    ? "border-red-500 bg-red-50"
                    : isThisSelected
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem
                  value={option}
                  id={`${exercise.id}-option-${optIndex}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`${exercise.id}-option-${optIndex}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-600 min-w-[24px]">
                      {optionLetter}.
                    </span>
                    <div className="text-slate-700 flex-1">
                      <ReactMarkdown components={markdownComponents}>
                        {option}
                      </ReactMarkdown>
                    </div>
                    {hasSubmitted && isThisCorrect && (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {hasSubmitted && isThisSelected && !isThisCorrect && (
                      <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          {!hasSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer || isSaving}
              className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
            >
              {isSaving ? "Guardando..." : "Verificar Respuesta"}
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline" disabled>
              Respuesta Guardada
            </Button>
          )}
        </div>

        {/* Explanation (shown after submission) */}
        {showAnswer && (
          <div
            className={`p-4 rounded-lg ${
              isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="font-medium text-slate-900 mb-2">
              Respuesta correcta:{" "}
              <ReactMarkdown
                components={{
                  ...markdownComponents,
                  p: ({ children }: any) => (
                    <span className="inline">{children}</span>
                  )
                }}
              >
                {exercise.correctAnswer}
              </ReactMarkdown>
            </div>
            <div className="text-slate-800 text-sm leading-relaxed">
              <ReactMarkdown components={blockMarkdownComponents}>
                {exercise.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
