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

export type Exercise =
  | TMultipleChoiceExercise
  | TCodeCompletionExercise
  | TDebuggingExercise
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
