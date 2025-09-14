// Database types and interfaces for JSensei
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'multiple-choice' | 'code-completion' | 'debugging' | 'coding';

// User related types
export interface User {
  id: string;
  display_name: string;
  email: string;
  skill_level: SkillLevel;
  placement_test_completed: boolean;
  placement_test_score: number;
  current_lesson_id?: string;
  total_points: number;
  streak_days: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  id: string;
  email: string;
  display_name?: string;
  skill_level?: SkillLevel;
}

export interface UpdateUserData {
  display_name?: string;
  skill_level?: SkillLevel;
  placement_test_completed?: boolean;
  placement_test_score?: number;
  current_lesson_id?: string;
  total_points?: number;
  streak_days?: number;
  last_activity_date?: string;
}

// Placement test related types
export interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty_level: DifficultyLevel;
  points: number;
  explanation: string;
  topic: string;
  created_at: string;
}

export interface CreatePlacementQuestionData {
  question: string;
  options: string[];
  correct_answer: string;
  difficulty_level: DifficultyLevel;
  points: number;
  explanation: string;
  topic: string;
}

export interface PlacementResponse {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  response_time: number;
  created_at: string;
}

export interface CreatePlacementResponseData {
  user_id: string;
  question_id: string;
  selected_answer: string;
  is_correct?: boolean;
  response_time?: number;
}

// Learning content related types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: any; // JSON content
  difficulty_level: DifficultyLevel;
  order_index: number;
  estimated_duration: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonData {
  title: string;
  description: string;
  content: any;
  difficulty_level: DifficultyLevel;
  order_index: number;
  estimated_duration: number;
}

export interface UpdateLessonData {
  title?: string;
  description?: string;
  content?: any;
  difficulty_level?: DifficultyLevel;
  order_index?: number;
  estimated_duration?: number;
}

// Progress tracking types
export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  attempts: number;
  time_spent: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProgressData {
  user_id: string;
  lesson_id: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  attempts?: number;
  time_spent?: number;
}

export interface UpdateUserProgressData {
  status?: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  attempts?: number;
  time_spent?: number;
  completed_at?: string;
}

// AI generated content types
export interface GeneratedContent {
  id: string;
  user_id: string;
  topic: string;
  skill_level: SkillLevel;
  content: any; // JSON content
  weak_areas: string[];
  strong_areas: string[];
  content_type: 'lesson' | 'exercise' | 'explanation' | 'adaptive';
  is_used: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGeneratedContentData {
  user_id: string;
  topic: string;
  skill_level: SkillLevel;
  content: any;
  weak_areas?: string[];
  strong_areas?: string[];
  content_type?: 'lesson' | 'exercise' | 'explanation' | 'adaptive';
}

export interface GeneratedExercise {
  id: string;
  user_id: string;
  topic: string;
  skill_level: SkillLevel;
  weak_areas: string[];
  exercises: any; // JSON exercises
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGeneratedExerciseData {
  user_id: string;
  topic: string;
  skill_level: SkillLevel;
  weak_areas?: string[];
  exercises: any;
}

// Exercise evaluation types
export interface ExerciseEvaluation {
  id: string;
  user_id: string;
  exercise_id: string;
  user_answer: string;
  is_correct: boolean;
  score: number;
  feedback?: string;
  suggestions: string[];
  detailed_explanation?: string;
  created_at: string;
}

export interface CreateExerciseEvaluationData {
  user_id: string;
  exercise_id: string;
  user_answer: string;
  is_correct: boolean;
  score?: number;
  feedback?: string;
  suggestions?: string[];
  detailed_explanation?: string;
}

export interface UserResponse {
  id: string;
  user_id: string;
  exercise_id: string;
  user_answer: string;
  is_correct: boolean;
  feedback?: string;
  score: number;
  suggestions: string[];
  detailed_explanation?: string;
  response_time?: number;
  created_at: string;
}

export interface CreateUserResponseData {
  user_id: string;
  exercise_id: string;
  user_answer: string;
  is_correct: boolean;
  score?: number;
  feedback?: string;
  suggestions?: string[];
  detailed_explanation?: string;
  response_time?: number;
}

// Learning path types
export interface LearningPath {
  id: string;
  user_id: string;
  path_id: string;
  title: string;
  description?: string;
  topics: any; // JSON topics
  estimated_duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLearningPathData {
  user_id: string;
  path_id: string;
  title: string;
  description?: string;
  topics: any;
  estimated_duration?: number;
}

// Placement analysis types
export interface PlacementAnalysis {
  id: string;
  user_id: string;
  skill_level: SkillLevel;
  weak_areas: string[];
  strong_areas: string[];
  recommended_topics: string[];
  personalized_advice?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePlacementAnalysisData {
  user_id: string;
  skill_level: SkillLevel;
  weak_areas?: string[];
  strong_areas?: string[];
  recommended_topics?: string[];
  personalized_advice?: string;
}

// Common database operation types
export interface DatabaseError {
  message: string;
  code?: string;
  details?: any;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}
