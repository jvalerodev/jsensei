import { Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
  // Componentes de markdown reutilizables para los ejercicios
  const markdownComponents = {
    code: ({ children, ...props }: any) => (
      <code
        className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-[monospace]"
        {...props}
      >
        {children}
      </code>
    ),
    p: ({ children }: any) => <span className="inline">{children}</span>,
    strong: ({ children }: any) => (
      <strong className="font-semibold text-slate-800">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>
  };

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
                <div className="text-slate-700 mb-4">
                  <ReactMarkdown components={markdownComponents}>
                    {exercise.question}
                  </ReactMarkdown>
                </div>

                {exercise.options && (
                  <div className="space-y-2 mb-4">
                    {exercise.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <div className="text-slate-700 flex-1">
                          <ReactMarkdown components={markdownComponents}>
                            {option}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    Ver respuesta y explicación
                  </summary>
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900 mb-2">
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
                    <div className="text-blue-800 text-sm leading-relaxed">
                      <ReactMarkdown
                        components={{
                          ...markdownComponents,
                          p: ({ children }: any) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          )
                        }}
                      >
                        {exercise.explanation}
                      </ReactMarkdown>
                    </div>
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
