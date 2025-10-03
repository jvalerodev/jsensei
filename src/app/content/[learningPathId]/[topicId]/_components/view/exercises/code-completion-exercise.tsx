"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Code, CheckCircle2, X } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { markdownComponents, blockMarkdownComponents } from "../markdown";
import type { TCodeCompletionExercise } from "./exercise-types";
import { useExerciseInteractions } from "@/hooks/use-exercise-interactions";

type CodeCompletionExerciseProps = {
  exercise: TCodeCompletionExercise;
  index: number;
  contentId: string;
};

export function CodeCompletionExercise({
  exercise,
  index,
  contentId
}: CodeCompletionExerciseProps) {
  const { saveAnswer, loadSavedAnswer, isLoading } =
    useExerciseInteractions(contentId);
  const [userCode, setUserCode] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(true);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | undefined>();
  const [aiSuggestions, setAiSuggestions] = useState<string[] | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);

  // Load saved answer on mount
  useEffect(() => {
    const loadAnswer = async () => {
      setIsLoadingAnswer(true);
      const savedAnswer = await loadSavedAnswer(exercise.id);
      if (savedAnswer) {
        setUserCode(savedAnswer.userAnswer);
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
  }, [exercise.id, loadSavedAnswer]);

  const handleSubmit = async () => {
    if (!userCode.trim()) return;

    const isAnswerCorrect =
      userCode.trim().toLowerCase() ===
      exercise.correctAnswer.trim().toLowerCase();

    setIsSaving(true);
    try {
      const result = await saveAnswer(
        exercise.id,
        userCode,
        exercise.correctAnswer,
        isAnswerCorrect,
        "code-completion",
        exercise.question
      );

      if (result.success) {
        setHasSubmitted(true);
        setAttemptNumber(result.attemptNumber || 1);
        setMaxAttemptsReached(result.maxAttemptsReached || false);
        setIsCompleted(isAnswerCorrect);
        
        if (!isAnswerCorrect) {
          setAiFeedback(result.aiFeedback);
          setAiSuggestions(result.aiSuggestions);
          setShowAnswer(result.maxAttemptsReached || false);
        } else {
          setShowAnswer(true);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setUserCode("");
    setHasSubmitted(false);
    setAiFeedback(undefined);
    setAiSuggestions(undefined);
  };

  // Simple comparison (you might want to make this more sophisticated)
  const isCorrect =
    hasSubmitted &&
    userCode.trim().toLowerCase() ===
      exercise.correctAnswer.trim().toLowerCase();

  // Parse question to separate description from code
  const parseQuestion = () => {
    // Extract code block and description
    const codeMatch = exercise.question.match(
      /([\s\S]*?)```javascript\n([\s\S]*?)\n```([\s\S]*)/
    );

    if (codeMatch) {
      return {
        beforeCode: codeMatch[1].trim(),
        code: codeMatch[2],
        afterCode: codeMatch[3].trim()
      };
    }

    // No code block found, treat entire question as description
    return {
      beforeCode: exercise.question,
      code: null,
      afterCode: ""
    };
  };

  const { beforeCode, code, afterCode } = parseQuestion();

  // Render code with input field inline
  const renderCodeWithInput = () => {
    if (!code) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tu código:
          </label>
          <Input
            type="text"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            disabled={hasSubmitted}
            style={{
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
            }}
          />
        </div>
      );
    }

    const parts = code.split("___");

    // If no blanks, just show the code
    if (parts.length === 1) {
      return (
        <div className="mb-4">
          <SyntaxHighlighter
            style={oneLight}
            language="javascript"
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              backgroundColor: "#fafafa",
              border: "1px solid #e2e8f0",
              padding: "1rem"
            }}
          >
            {code}
          </SyntaxHighlighter>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tu código:
            </label>
            <Input
              type="text"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              disabled={hasSubmitted}
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
              }}
            />
          </div>
        </div>
      );
    }

    // Render code with inline input
    // Use the same exact style as LessonContent
    return (
      <div className="mb-4">
        <div
          className="rounded-lg border border-slate-200 overflow-hidden"
          style={{
            margin: 0,
            backgroundColor: "#fafafa",
            padding: "1rem"
          }}
        >
          <pre
            className="overflow-x-auto"
            style={{
              margin: 0,
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.875rem",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
            }}
          >
            {parts.map((part, idx) => (
              <span key={idx}>
                <SyntaxHighlighter
                  style={oneLight}
                  language="javascript"
                  PreTag="span"
                  CodeTag="code"
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "0.875rem",
                    display: "inline",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                  }}
                  codeTagProps={{
                    style: {
                      display: "inline",
                      backgroundColor: "transparent",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                    }
                  }}
                >
                  {part}
                </SyntaxHighlighter>
                {idx < parts.length - 1 && (
                  <>
                    {showAnswer ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold ${
                          isCorrect
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {userCode || "___"}
                      </span>
                    ) : (
                      <Input
                        type="text"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        className="inline-block w-auto min-w-[8rem] max-w-xs h-7 px-2 py-1 text-sm bg-white border-1 border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
                        placeholder="..."
                        disabled={isCompleted || maxAttemptsReached}
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                        }}
                      />
                    )}
                  </>
                )}
              </span>
            ))}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Ejercicio {index + 1}
          <Badge variant="outline" className="text-xs">
            {exercise.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Code className="h-3 w-3 mr-1" />
            Completar código
          </Badge>
          {hasSubmitted && isCorrect && (
            <Badge
              variant="default"
              className="text-xs bg-green-600 text-white font-bold"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Correcto
            </Badge>
          )}
          {hasSubmitted && !isCorrect && (
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
        {/* Question Description (before code) */}
        {beforeCode && (
          <div className="text-slate-700 mb-4">
            <ReactMarkdown components={markdownComponents}>
              {beforeCode}
            </ReactMarkdown>
          </div>
        )}

        {/* Code block with input */}
        {renderCodeWithInput()}

        {/* Additional description (after code) */}
        {afterCode && (
          <div className="text-slate-700 mb-4">
            <ReactMarkdown components={markdownComponents}>
              {afterCode}
            </ReactMarkdown>
          </div>
        )}

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
                disabled={!userCode.trim() || isSaving || isCompleted}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                {isSaving ? "Guardando..." : "Verificar Código"}
              </Button>
            ) : isCompleted ? (
              <Button variant="outline" disabled>
                ✓ Completado
              </Button>
            ) : maxAttemptsReached ? (
              <Button variant="outline" disabled>
                Máximo de intentos alcanzado
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
            <div className="font-medium text-slate-900 mb-2 flex items-center flex-wrap gap-2">
              <span>Respuesta correcta:</span>
              <code className="bg-slate-100 text-rose-600 px-2 py-1 rounded text-sm font-mono border border-slate-300">
                {exercise.correctAnswer}
              </code>
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
