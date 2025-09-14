// Database layer entry point - exports all models and utilities
import { createClient as createBrowserClient } from '@/lib/supabase/client';

// Models
import { UserModel } from './models/user-model';
import { PlacementQuestionModel, PlacementResponseModel } from './models/placement-model';
import { LessonModel } from './models/lesson-model';
import { UserProgressModel } from './models/progress-model';
import { 
  GeneratedContentModel, 
  GeneratedExerciseModel, 
  ExerciseEvaluationModel, 
  UserResponseModel 
} from './models/content-model';
import { LearningPathModel, PlacementAnalysisModel } from './models/learning-path-model';

// Types
export * from './types';

/**
 * Database service class that provides access to all models
 */
export class DatabaseService {
  // Models
  public users: UserModel;
  public placementQuestions: PlacementQuestionModel;
  public placementResponses: PlacementResponseModel;
  public lessons: LessonModel;
  public userProgress: UserProgressModel;
  public generatedContent: GeneratedContentModel;
  public generatedExercises: GeneratedExerciseModel;
  public exerciseEvaluations: ExerciseEvaluationModel;
  public userResponses: UserResponseModel;
  public learningPaths: LearningPathModel;
  public placementAnalysis: PlacementAnalysisModel;

  constructor(supabase: any) {
    // Initialize all models with the supabase client
    this.users = new UserModel(supabase);
    this.placementQuestions = new PlacementQuestionModel(supabase);
    this.placementResponses = new PlacementResponseModel(supabase);
    this.lessons = new LessonModel(supabase);
    this.userProgress = new UserProgressModel(supabase);
    this.generatedContent = new GeneratedContentModel(supabase);
    this.generatedExercises = new GeneratedExerciseModel(supabase);
    this.exerciseEvaluations = new ExerciseEvaluationModel(supabase);
    this.userResponses = new UserResponseModel(supabase);
    this.learningPaths = new LearningPathModel(supabase);
    this.placementAnalysis = new PlacementAnalysisModel(supabase);
  }
}

/**
 * Create database service for browser/client-side usage
 */
export function createClientDatabase(): DatabaseService {
  const supabase = createBrowserClient();
  return new DatabaseService(supabase);
}

// Note: Server-side database functions are now in ./server.ts
// This avoids import issues with client components

// Export individual model classes for direct usage if needed
export {
  UserModel,
  PlacementQuestionModel,
  PlacementResponseModel,
  LessonModel,
  UserProgressModel,
  GeneratedContentModel,
  GeneratedExerciseModel,
  ExerciseEvaluationModel,
  UserResponseModel,
  LearningPathModel,
  PlacementAnalysisModel
};
