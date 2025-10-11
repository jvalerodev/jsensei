"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Terminal, CheckCircle2, X, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { questionMarkdownComponents, blockMarkdownComponents } from "../markdown";
import type { TCodingExercise } from "./exercise-types";
import { useExerciseInteractions } from "@/hooks/use-exercise-interactions";

type CodingExerciseProps = {
  exercise: TCodingExercise;
  index: number;
  contentId: string;
  onCompleted?: () => void;
  topicTitle?: string;
};

export function CodingExercise({
  exercise: initialExercise,
  index,
  contentId,
  onCompleted,
  topicTitle = "Topic"
}: CodingExerciseProps) {
  const { saveAnswer, loadSavedAnswer, regenerateExercise, isLoading } = useExerciseInteractions(contentId);
  
  // Local state for exercise (allows updating without page refresh)
  const [exercise, setExercise] = useState<TCodingExercise>(initialExercise);
  const [userCode, setUserCode] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(true);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<string | undefined>();
  const [aiSuggestions, setAiSuggestions] = useState<string[] | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    isPassing: boolean;
    score: number;
  } | null>(null);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load saved answer on mount
  useEffect(() => {
    const loadAnswer = async () => {
      setIsLoadingAnswer(true);
      const savedAnswer = await loadSavedAnswer(exercise.id);
      if (savedAnswer) {
        setUserCode(savedAnswer.userAnswer);
        setHasSubmitted(true);
        setAttemptNumber(savedAnswer.attemptNumber);
        setIsCompleted(savedAnswer.isCompleted);
        setAiFeedback(savedAnswer.aiFeedback);
        setAiSuggestions(savedAnswer.aiSuggestions);
        setShowFeedback(savedAnswer.isCompleted || savedAnswer.attemptNumber > 0);
        
        // Restore evaluation result if completed
        if (savedAnswer.isCompleted && savedAnswer.aiFeedback) {
          setEvaluationResult({
            isPassing: true,
            score: 100
          });
        }
      }
      setIsLoadingAnswer(false);
    };

    loadAnswer();
  }, [exercise.id, loadSavedAnswer]);

  const handleSubmit = async () => {
    if (!userCode.trim()) return;

    setIsSaving(true);
    try {
      // Para ejercicios de código, la evaluación es con IA
      // No hay una respuesta correcta única
      const result = await saveAnswer(
        exercise.id,
        userCode,
        "", // No hay correctAnswer para coding exercises
        false, // Se evaluará con IA
        "coding",
        exercise.question,
        exercise.explanation // Criterios de evaluación
      );

      if (result.success) {
        setHasSubmitted(true);
        setAttemptNumber(result.attemptNumber || 1);
        setAiFeedback(result.aiFeedback);
        setAiSuggestions(result.aiSuggestions);
        setShowFeedback(true);
        setMaxAttemptsReached(result.maxAttemptsReached || false);

        // La IA ya evaluó el código y determinó si es correcto
        const isPassing = result.isCorrect || false;
        const codeScore = result.score || 0;

        setEvaluationResult({
          isPassing,
          score: codeScore
        });

        setIsCompleted(isPassing);

        if (isPassing) {
          onCompleted?.();
        }
      } else if (result.maxAttemptsReached) {
        setMaxAttemptsReached(true);
        setShowFeedback(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setUserCode("");
    setHasSubmitted(false);
    setShowFeedback(false);
    setAiFeedback(undefined);
    setAiSuggestions(undefined);
    setEvaluationResult(null);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateExercise(
        "coding",
        topicTitle,
        exercise.question
      );

      if (result.success && result.newExercise) {
        // Update exercise with new one
        setExercise(result.newExercise as TCodingExercise);
        
        // Reset all states
        setUserCode("");
        setHasSubmitted(false);
        setShowFeedback(false);
        setAiFeedback(undefined);
        setAiSuggestions(undefined);
        setEvaluationResult(null);
        setMaxAttemptsReached(false);
        setAttemptNumber(0);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
          Ejercicio {index + 1}
          <Badge variant="outline" className="text-xs">
            {exercise.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Terminal className="h-3 w-3 mr-1" />
            Código
          </Badge>
          {isCompleted && evaluationResult?.isPassing && (
            <Badge
              variant="default"
              className="text-xs bg-green-600 text-white font-bold"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completado
            </Badge>
          )}
          {hasSubmitted && !isCompleted && evaluationResult && !evaluationResult.isPassing && (
            <Badge
              variant="default"
              className="text-xs bg-amber-600 text-white font-bold"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Puede mejorar
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Question */}
        <div className="text-slate-700 mb-4">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={questionMarkdownComponents}
          >
            {exercise.question}
          </ReactMarkdown>
        </div>

        {/* Code Editor (Textarea) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tu código:
          </label>
          <Textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            placeholder="// Escribe tu código aquí..."
            disabled={isCompleted}
            className="min-h-[300px] font-mono text-sm bg-slate-50 border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-y"
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: "0.875rem",
              lineHeight: "1.7",
              tabSize: 2
            }}
          />
          <div className="mt-2 text-xs text-slate-500">
            Caracteres: {userCode.length}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="text-sm text-slate-600">
            {attemptNumber > 0 && (
              <span>
                Intento {attemptNumber}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!hasSubmitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!userCode.trim() || isSaving}
                className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
              >
                {isSaving ? "Evaluando..." : "Enviar Código"}
              </Button>
            ) : isCompleted ? (
              <Button variant="outline" disabled>
                ✓ Completado
              </Button>
            ) : maxAttemptsReached ? (
              <Button 
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
              >
                {isRegenerating ? "Regenerando..." : "🔄 Regenerar Ejercicio"}
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

        {/* AI Feedback (shown after submission) */}
        {showFeedback && aiFeedback && (
          <div className={`p-4 rounded-lg border mb-4 ${
            evaluationResult?.isPassing 
              ? "bg-green-50 border-green-200" 
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className={`font-medium mb-2 flex items-center gap-2 ${
              evaluationResult?.isPassing 
                ? "text-green-900" 
                : "text-amber-900"
            }`}>
              {evaluationResult?.isPassing ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Excelente trabajo
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4" />
                  Feedback
                </>
              )}
            </div>
            <div className={`text-sm leading-relaxed mb-3 ${
              evaluationResult?.isPassing 
                ? "text-green-800" 
                : "text-amber-800"
            }`}>
              {aiFeedback}
            </div>
            {aiSuggestions && aiSuggestions.length > 0 && !evaluationResult?.isPassing && (
              <div className="mt-3">
                <div className="font-medium text-amber-900 text-sm mb-2">
                  Sugerencias para mejorar:
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
        {showFeedback && (
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              Criterios de evaluación
            </div>
            <div className="text-slate-800 text-sm leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={blockMarkdownComponents}
              >
                {exercise.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
