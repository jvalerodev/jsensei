import type { LearningPath } from "@/lib/ai/schemas";
import type { UserProgress } from "@/lib/database/types";

/**
 * Fetch user's learning path from database
 */
export async function getUserLearningPath(db: any, userId: string): Promise<LearningPath | null> {
  try {
    // Get the most recent learning path for the user
    const learningPath = await db.learningPaths.getActivePath(userId);
    
    if (!learningPath) {
      console.log("No learning path found for user:", userId);
      return null;
    }

    // Ensure the learning path has the correct structure
    return {
      id: learningPath.path_id || learningPath.id,
      title: learningPath.title,
      description: learningPath.description,
      topics: learningPath.topics,
      estimatedDuration: learningPath.estimated_duration
    };
  } catch (error) {
    console.error("Error fetching user learning path:", error);
    return null;
  }
}

/**
 * Get user progress data
 */
export async function getUserProgressData(db: any, userId: string) {
  try {
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
export async function getUserRecentActivity(db: any, userId: string) {
  try {
    // Get recent user interactions (including placement test answers)
    const recentActivityResult = await db.userInteractions.findAll(
      { user_id: userId }, 
      { limit: 5, orderBy: 'created_at', orderDirection: 'desc' }
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
  userLearningPath: LearningPath | null,
  progress: UserProgress[]
) {
  const totalTopics = userLearningPath?.topics.length || 12;
  const completedLessons = progress?.filter((p: UserProgress) => p.status === 'completed').length || 0;
  const overallProgress = Math.round((completedLessons / totalTopics) * 100);

  return {
    totalTopics,
    completedLessons,
    overallProgress
  };
}
