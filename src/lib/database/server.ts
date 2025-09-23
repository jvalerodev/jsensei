// Server-side database service - only for use in server components and API routes
import { createClient as createServerClient } from "@/lib/supabase/server";

// Models
import { UserModel } from "./models/user-model";
import { PlacementTestModel } from "./models/placement-model";
import { UserProgressModel } from "./models/progress-model";
import { ContentModel } from "./models/content-model";
import { UserInteractionModel } from "./models/user-interaction-model";
import { LearningPathModel } from "./models/learning-path-model";

// Types
export * from "./types";

// Global server database instance
let serverDbInstance: ServerDatabaseService | null = null;

/**
 * Database service class that provides access to all models (server-side only)
 */
export class ServerDatabaseService {
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
 * Create database service for server-side usage
 */
export async function createServerDatabase(): Promise<ServerDatabaseService> {
  const supabase = await createServerClient();
  return new ServerDatabaseService(supabase);
}

/**
 * Get or create the global server database instance
 * This ensures we only create one instance and reuse it
 */
export async function getDatabase(): Promise<ServerDatabaseService> {
  if (!serverDbInstance) {
    serverDbInstance = await createServerDatabase();
  }
  return serverDbInstance;
}

/**
 * Reset the server database instance (useful for testing or when needed)
 */
export function resetServerDb(): void {
  serverDbInstance = null;
}

// Export individual model classes for direct usage if needed
export {
  UserModel,
  PlacementTestModel,
  UserProgressModel,
  ContentModel,
  UserInteractionModel,
  LearningPathModel
};
