import { Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Exercise = {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
};

type ExerciseSectionProps = {
  exercises: Exercise[];
};

export function ExerciseSection({ exercises }: ExerciseSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-orange-600" />
          Ejercicios Prácticos
        </CardTitle>
        <CardDescription>Pon en práctica lo que has aprendido</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {exercises.map((exercise, index) => (
            <Card
              key={exercise.id || index}
              className="border-l-4 border-l-orange-500"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Ejercicio {index + 1}
                  <Badge variant="outline" className="text-xs">
                    {exercise.difficulty}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">{exercise.question}</p>

                {exercise.options && (
                  <div className="space-y-2 mb-4">
                    {exercise.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs font-medium">
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span className="text-slate-700">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    Ver respuesta y explicación
                  </summary>
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">
                      Respuesta correcta: {exercise.correctAnswer}
                    </p>
                    <p className="text-blue-800 text-sm">
                      {exercise.explanation}
                    </p>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
