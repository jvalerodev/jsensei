// Database types and interfaces for JSensei v2.1
export type SkillLevel = 'beginner' | 'intermediate';
export type DifficultyLevel = 'beginner' | 'intermediate';
export type ContentType = 'lesson' | 'exercise' | 'quiz' | 'explanation' | 'example';
export type InteractionType = 'placement_answer' | 'exercise_answer' | 'lesson_completion' | 'quiz_answer';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';

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
export interface PlacementTest {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  topic: string;
  difficulty_level: DifficultyLevel;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface CreatePlacementTestData {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  topic: string;
  difficulty_level: DifficultyLevel;
  points?: number;
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

// Content related types (unified)
export interface Content {
  id: string;
  user_id?: string;
  learning_path_id?: string;
  topic_id?: string;
  title: string;
  description?: string;
  content_type: ContentType;
  skill_level: SkillLevel;
  content: any; // JSON content
  difficulty_adjustment: number;
  estimated_duration: number;
  order_index: number;
  is_generated_by_ai: boolean;
  is_active: boolean;
  target_weak_areas: string[];
  target_strong_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateContentData {
  user_id?: string;
  learning_path_id?: string;
  topic_id?: string;
  title: string;
  description?: string;
  content_type: ContentType;
  skill_level: SkillLevel;
  content: any;
  difficulty_adjustment?: number;
  estimated_duration?: number;
  order_index?: number;
  is_generated_by_ai?: boolean;
  target_weak_areas?: string[];
  target_strong_areas?: string[];
}

export interface UpdateContentData {
  title?: string;
  description?: string;
  content_type?: ContentType;
  content?: any;
  difficulty_adjustment?: number;
  estimated_duration?: number;
  order_index?: number;
  is_active?: boolean;
}

// Progress tracking types
export interface UserProgress {
  id: string;
  user_id: string;
  learning_path_id: string;
  content_id?: string;
  topic: string;
  status: ProgressStatus;
  score: number;
  attempts: number;
  time_spent: number;
  current_difficulty: number;
  recent_scores: number[];
  struggling_areas: string[];
  mastered_concepts: string[];
  started_at?: string;
  completed_at?: string;
  last_interaction: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProgressData {
  user_id: string;
  learning_path_id: string;
  content_id?: string;
  topic: string;
  status?: ProgressStatus;
  score?: number;
  attempts?: number;
  time_spent?: number;
}

export interface UpdateUserProgressData {
  status?: ProgressStatus;
  score?: number;
  attempts?: number;
  time_spent?: number;
  current_difficulty?: number;
  recent_scores?: number[];
  struggling_areas?: string[];
  mastered_concepts?: string[];
  started_at?: string;
  completed_at?: string;
  last_interaction?: string;
}

// User interactions (unified) types
export interface UserInteraction {
  id: string;
  user_id: string;
  content_id?: string;
  placement_test_id?: string;
  interaction_type: InteractionType;
  user_answer?: string;
  correct_answer?: string;
  is_correct?: boolean;
  score?: number;
  response_time?: number;
  ai_feedback?: string;
  ai_suggestions: string[];
  ai_explanation?: string;
  created_at: string;
}

export interface CreateUserInteractionData {
  user_id: string;
  content_id?: string;
  placement_test_id?: string;
  interaction_type: InteractionType;
  user_answer?: string;
  correct_answer?: string;
  is_correct?: boolean;
  score?: number;
  response_time?: number;
  ai_feedback?: string;
  ai_suggestions?: string[];
  ai_explanation?: string;
}

// Learning path types
export interface LearningPath {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  skill_level: SkillLevel;
  weak_areas: string[];
  strong_areas: string[];
  recommended_topics: string[];
  topics: any; // JSON topics with topic_id references
  estimated_duration: number;
  is_active: boolean;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLearningPathData {
  user_id: string;
  title: string;
  description?: string;
  skill_level: SkillLevel;
  weak_areas?: string[];
  strong_areas?: string[];
  recommended_topics?: string[];
  topics: any;
  estimated_duration?: number;
}

// Topic content helper types
export interface TopicContent {
  topic_id: string;
  topic_name: string;
  content_items: Content[];
}

export interface LearningPathWithContent {
  learning_path: LearningPath;
  topics: TopicContent[];
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
