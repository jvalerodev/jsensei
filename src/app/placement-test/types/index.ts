export type Question = {
  id: string;
  question: string;
  options: any; // JSONB array de opciones
  correct_answer: string;
  explanation?: string;
  topic: string;
  difficulty_level: "beginner" | "intermediate";
  points: number;
  is_active: boolean;
  created_at: string;
};

export type TestResult = {
  totalScore: number;
  maxScore: number;
  skillLevel: "beginner" | "intermediate";
  correctAnswers: number;
  totalQuestions: number;
};

export type UserAnswer = {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number;
};
