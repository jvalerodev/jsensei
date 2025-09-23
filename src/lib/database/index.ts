// Database layer entry point - exports all models and utilities
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// Models
import { UserModel } from "./models/user-model";
import { PlacementTestModel } from "./models/placement-model";
import { UserProgressModel } from "./models/progress-model";
import { ContentModel } from "./models/content-model";
import { UserInteractionModel } from "./models/user-interaction-model";
import { LearningPathModel } from "./models/learning-path-model";

// Types
export * from "./types";

/**
 * Database service class that provides access to all models
 */
export class DatabaseService {
  // Models
  public users: UserModel;
  public placementTests: PlacementTestModel;
  public userProgress: UserProgressModel;
  public contents: ContentModel;
  public userInteractions: UserInteractionModel;
  public learningPaths: LearningPathModel;

  constructor(supabase: any) {
    // Initialize all models with the supabase client
    this.users = new UserModel(supabase);
    this.placementTests = new PlacementTestModel(supabase);
    this.userProgress = new UserProgressModel(supabase);
    this.contents = new ContentModel(supabase);
    this.userInteractions = new UserInteractionModel(supabase);
    this.learningPaths = new LearningPathModel(supabase);
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
  PlacementTestModel,
  UserProgressModel,
  ContentModel,
  UserInteractionModel,
  LearningPathModel
};
