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

// Global server database instance with session tracking
let serverDbInstance: ServerDatabaseService | null = null;
let currentSessionUserId: string | null = null;

/**
 * Database service class that provides access to all models (server-side only)
 *
 * IMPORTANT: This class should NOT be cached globally. Always create a new instance
 * per request to ensure fresh Supabase client with correct session/cookies.
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
 *
 * IMPORTANT: Always creates a fresh instance per call to ensure correct session handling.
 * Never cache this result globally - it would cause session/authentication issues.
 */
export async function createServerDatabase(): Promise<ServerDatabaseService> {
  const supabase = await createServerClient();
  return new ServerDatabaseService(supabase);
}

/**
 * Get database instance with automatic session change detection
 *
 * This function implements a smart singleton that:
 * 1. Caches the instance for performance (same session)
 * 2. Automatically detects session changes (different user)
 * 3. Resets the instance when session changes
 * 4. Can be manually reset via resetDatabaseInstance()
 */
export async function getDatabase(): Promise<ServerDatabaseService> {
  // Get current user session
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  // Check if session changed (different user or logout)
  const sessionChanged = currentSessionUserId !== currentUserId;

  // Reset instance if session changed or doesn't exist
  if (sessionChanged || !serverDbInstance) {
    serverDbInstance = await createServerDatabase();
    currentSessionUserId = currentUserId;
  }

  return serverDbInstance;
}

/**
 * Manually reset the server database instance
 * Useful for logout or when you need to force a fresh instance
 */
export function resetDatabaseInstance(): void {
  serverDbInstance = null;
  currentSessionUserId = null;
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
