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
  options?: string[];
};

export type Exercise =
  | TMultipleChoiceExercise
  | TCodeCompletionExercise
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
