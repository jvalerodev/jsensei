"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Check, X, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
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
  onCompleted?: () => void;
  topicTitle?: string;
};

export function MultipleChoiceExercise({
  exercise,
  index,
  contentId,
  onCompleted,
  topicTitle = "Topic"
}: MultipleChoiceExerciseProps) {
  const { saveAnswer, loadSavedAnswer, regenerateExercise, isLoading } = useExerciseInteractions(contentId);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(true);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | undefined>();
  const [aiSuggestions, setAiSuggestions] = useState<string[] | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(exercise);

  // Load saved answer on mount or when exercise changes
  useEffect(() => {
    const loadAnswer = async () => {
      setIsLoadingAnswer(true);
      const savedAnswer = await loadSavedAnswer(currentExercise.id);
      if (savedAnswer) {
        setSelectedAnswer(savedAnswer.userAnswer);
        setHasSubmitted(true);
        setAttemptNumber(savedAnswer.attemptNumber);
        setMaxAttemptsReached(savedAnswer.maxAttemptsReached);
        setIsCompleted(savedAnswer.isCompleted);
        setAiFeedback(savedAnswer.aiFeedback);
        setAiSuggestions(savedAnswer.aiSuggestions);
        // Show answer only if completed or max attempts reached
        setShowAnswer(savedAnswer.isCompleted || savedAnswer.maxAttemptsReached);
      }
      setIsLoadingAnswer(false);
    };

    loadAnswer();
  }, [currentExercise.id, loadSavedAnswer]);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    const isAnswerCorrect = selectedAnswer === currentExercise.correctAnswer;

    setIsSaving(true);
    try {
      const result = await saveAnswer(
        currentExercise.id,
        selectedAnswer,
        currentExercise.correctAnswer,
        isAnswerCorrect,
        "multiple-choice",
        currentExercise.question // Send question for AI feedback
      );

      if (result.success) {
        setHasSubmitted(true);
        setAttemptNumber(result.attemptNumber || 1);
        setMaxAttemptsReached(result.maxAttemptsReached || false);
        setIsCompleted(isAnswerCorrect);
        
        // Set AI feedback if incorrect
        if (!isAnswerCorrect) {
          setAiFeedback(result.aiFeedback);
          setAiSuggestions(result.aiSuggestions);
          setShowAnswer(result.maxAttemptsReached || false);
        } else {
          // If correct, show answer immediately
          setShowAnswer(true);
        }

        // Call onCompleted callback if exercise is completed or max attempts reached
        if (isAnswerCorrect || result.maxAttemptsReached) {
          onCompleted?.();
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer("");
    setHasSubmitted(false);
    setAiFeedback(undefined);
    setAiSuggestions(undefined);
  };

  const handleRegenerateExercise = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateExercise(
        "multiple-choice",
        topicTitle,
        currentExercise.question
      );

      if (result.success && result.newExercise) {
        // Update to the new exercise with the new data
        setCurrentExercise({
          ...currentExercise, // Keep type and other metadata
          id: result.newExercise.id,
          question: result.newExercise.question,
          options: result.newExercise.options,
          correctAnswer: result.newExercise.correctAnswer,
          explanation: result.newExercise.explanation,
          difficulty: result.newExercise.difficulty
        });
        // Reset all states
        setSelectedAnswer("");
        setShowAnswer(false);
        setHasSubmitted(false);
        setAttemptNumber(0);
        setMaxAttemptsReached(false);
        setIsCompleted(false);
        setAiFeedback(undefined);
        setAiSuggestions(undefined);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const isCorrect = hasSubmitted && selectedAnswer === currentExercise.correctAnswer;
  const isIncorrect = hasSubmitted && selectedAnswer !== currentExercise.correctAnswer;

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
          Ejercicio {index + 1}
          <Badge variant="outline" className="text-xs">
            {currentExercise.difficulty}
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
          {isIncorrect && !maxAttemptsReached && (
            <Badge
              variant="destructive"
              className="text-xs text-white font-bold"
            >
              <X className="h-3 w-3 mr-1" />
              Incorrecto
            </Badge>
          )}
          {maxAttemptsReached && !isCompleted && (
            <Badge
              variant="default"
              className="text-xs bg-amber-600 text-white font-bold animate-pulse"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              ¡Sigue intentando!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Question */}
        <div className="text-slate-700 mb-4">
          <ReactMarkdown components={markdownComponents}>
            {currentExercise.question}
          </ReactMarkdown>
        </div>

        {/* Options with Radio Buttons */}
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          disabled={isCompleted}
          className="space-y-3 mb-4"
        >
          {currentExercise.options.map((option, optIndex) => {
            const optionLetter = String.fromCharCode(65 + optIndex);
            const isThisCorrect = option === currentExercise.correctAnswer;
            const isThisSelected = option === selectedAnswer;

            return (
              <div
                key={optIndex}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                  showAnswer && isThisCorrect
                    ? "border-green-500 bg-green-50"
                    : showAnswer && isThisSelected && !isThisCorrect
                    ? "border-red-500 bg-red-50"
                    : isThisSelected
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem
                  value={option}
                  id={`${currentExercise.id}-option-${optIndex}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`${currentExercise.id}-option-${optIndex}`}
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
                    {showAnswer && isThisCorrect && (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {showAnswer && isThisSelected && !isThisCorrect && (
                      <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="text-sm text-slate-600">
            {attemptNumber > 0 && (
              <span>
                Intento {attemptNumber} de 3
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!hasSubmitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSaving || isCompleted}
                className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
              >
                {isSaving ? "Guardando..." : "Verificar Respuesta"}
              </Button>
            ) : isCompleted ? (
              <Button variant="outline" disabled>
                ✓ Completado
              </Button>
            ) : maxAttemptsReached ? (
              <Button 
                onClick={handleRegenerateExercise}
                disabled={isRegenerating}
                className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar con otro ejercicio
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleRetry} 
                variant="outline"
                className="cursor-pointer"
              >
                Intentar de nuevo
              </Button>
            )}
          </div>
        </div>

        {/* AI Feedback (shown after incorrect answer, before max attempts) */}
        {hasSubmitted && !isCorrect && !maxAttemptsReached && aiFeedback && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 mb-4">
            <div className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              💡 Feedback
            </div>
            <div className="text-amber-800 text-sm leading-relaxed mb-3">
              {aiFeedback}
            </div>
            {aiSuggestions && aiSuggestions.length > 0 && (
              <div className="mt-3">
                <div className="font-medium text-amber-900 text-sm mb-2">
                  Pistas:
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                  {aiSuggestions.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
                {currentExercise.correctAnswer}
              </ReactMarkdown>
            </div>
            <div className="text-slate-800 text-sm leading-relaxed">
              <ReactMarkdown components={blockMarkdownComponents}>
                {currentExercise.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
