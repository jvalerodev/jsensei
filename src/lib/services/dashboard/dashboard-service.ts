import type {
  LearningPath as DBLearningPath,
  UserProgress
} from "@/lib/database/types";
import type { LearningPath as AILearningPath } from "@/lib/ai/schemas";
import { getDatabase } from "@/lib/database/server";

/**
 * Transform database learning path to AI schema format
 */
function transformLearningPath(dbLearningPath: DBLearningPath): AILearningPath {
  return {
    id: dbLearningPath.id,
    title: dbLearningPath.title,
    description: dbLearningPath.description || "",
    topics: dbLearningPath.topics || [],
    estimatedDuration: dbLearningPath.estimated_duration
  };
}

/**
 * Fetch user's learning path from database
 */
export async function getUserLearningPath(
  userId: string
): Promise<AILearningPath | null> {
  try {
    const db = await getDatabase();
    // Get the most recent learning path for the user
    const learningPath = await db.learningPaths.getActivePath(userId);

    if (!learningPath) {
      console.log("No learning path found for user:", userId);
      return null;
    }

    // Transform to AI schema format for frontend compatibility
    return transformLearningPath(learningPath);
  } catch (error) {
    console.error("Error fetching user learning path:", error);
    return null;
  }
}

/**
 * Get user progress data
 */
export async function getUserProgressData(userId: string) {
  try {
    const db = await getDatabase();
    const progressResult = await db.userProgress.getUserProgress(userId);
    return progressResult.data;
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return [];
  }
}

/**
 * Get user's recent activity
 */
export async function getUserRecentActivity(userId: string) {
  try {
    const db = await getDatabase();
    // Get recent user interactions (including placement test answers)
    const recentActivityResult = await db.userInteractions.findAll(
      { user_id: userId },
      { limit: 5, orderBy: "created_at", orderDirection: "desc" }
    );
    return recentActivityResult.data;
  } catch (error) {
    console.error("Error fetching user recent activity:", error);
    return [];
  }
}

/**
 * Calculate dashboard statistics
 */
export function calculateDashboardStats(
  userLearningPath: AILearningPath | null,
  progress: UserProgress[]
) {
  const totalTopics = userLearningPath?.topics.length || 12;
  const completedLessons =
    progress?.filter((p: UserProgress) => p.status === "completed").length || 0;
  const overallProgress = Math.round((completedLessons / totalTopics) * 100);

  return {
    totalTopics,
    completedLessons,
    overallProgress
  };
}
