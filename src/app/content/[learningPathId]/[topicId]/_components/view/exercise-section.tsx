"use client";

import { Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  MultipleChoiceExercise,
  CodeCompletionExercise,
  DebuggingExercise,
  CodingExercise,
  type Exercise
} from "./exercises";

type ExerciseSectionProps = {
  exercises: (Exercise & { contentId: string })[];
  onExerciseCompleted?: () => void;
  topicTitle?: string;
};

export function ExerciseSection({ exercises, onExerciseCompleted, topicTitle }: ExerciseSectionProps) {

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-orange-600" />
          Ejercicios Prácticos
        </CardTitle>
        <CardDescription>
          Pon en práctica lo que has aprendido ({exercises.length}{" "}
          {exercises.length === 1 ? "ejercicio" : "ejercicios"})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {exercises.map((exercise, index) => {
            // Render different components based on exercise type
            switch (exercise.type) {
              case "multiple-choice":
                return (
                  <MultipleChoiceExercise
                    key={exercise.id || index}
                    exercise={exercise as any}
                    index={index}
                    contentId={exercise.contentId}
                    onCompleted={onExerciseCompleted}
                    topicTitle={topicTitle}
                  />
                );

              case "code-completion":
                return (
                  <CodeCompletionExercise
                    key={exercise.id || index}
                    exercise={exercise as any}
                    index={index}
                    contentId={exercise.contentId}
                    onCompleted={onExerciseCompleted}
                    topicTitle={topicTitle}
                  />
                );

              case "debugging":
                return (
                  <DebuggingExercise
                    key={exercise.id || index}
                    exercise={exercise as any}
                    index={index}
                    contentId={exercise.contentId}
                    onCompleted={onExerciseCompleted}
                    topicTitle={topicTitle}
                  />
                );

              case "coding":
                return (
                  <CodingExercise
                    key={exercise.id || index}
                    exercise={exercise as any}
                    index={index}
                    contentId={exercise.contentId}
                    onCompleted={onExerciseCompleted}
                    topicTitle={topicTitle}
                  />
                );

              default:
                // Fallback for unknown types (shouldn't happen with proper typing)
                const unknownExercise = exercise as Exercise;
                return (
                  <Card
                    key={unknownExercise.id || index}
                    className="border-l-4 border-l-slate-400"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">
                        Ejercicio {index + 1} - Tipo: {unknownExercise.type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-2">{unknownExercise.question}</p>
                      <p className="text-sm text-slate-500">
                        Este tipo de ejercicio aún no está implementado.
                      </p>
                    </CardContent>
                  </Card>
                );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
}
