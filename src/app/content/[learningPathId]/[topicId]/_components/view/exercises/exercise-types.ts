export type ExerciseType =
  | "multiple-choice"
  | "code-completion"
  | "debugging"
  | "coding";

export type BaseExercise = {
  id: string;
  question: string;
  type: ExerciseType;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
};

export type TMultipleChoiceExercise = BaseExercise & {
  type: "multiple-choice";
  options: string[];
};

export type TCodeCompletionExercise = BaseExercise & {
  type: "code-completion";
  options: string[]; // Ahora requerido - debe tener 4 opciones
};

export type TDebuggingExercise = BaseExercise & {
  type: "debugging";
  options: string[]; // Debe tener 4 opciones
};

export type TCodingExercise = {
  id: string;
  question: string;
  type: "coding";
  explanation: string; // Criterios de evaluación
  difficulty: string;
  // NO tiene correctAnswer (múltiples soluciones válidas)
  // NO tiene options (el usuario escribe libremente)
};

export type Exercise =
  | TMultipleChoiceExercise
  | TCodeCompletionExercise
  | TDebuggingExercise
  | TCodingExercise
  | BaseExercise;

export type ExerciseComponentProps = {
  exercise: Exercise;
  index: number;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  showAnswer: boolean;
  onToggleAnswer: () => void;
  isCorrect: boolean | null;
};
