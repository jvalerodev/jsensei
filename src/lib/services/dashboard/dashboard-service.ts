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
 * Get completed topic IDs for a user's learning path
 */
export async function getCompletedTopicIds(
  userId: string,
  learningPathId: string
): Promise<string[]> {
  try {
    const db = await getDatabase();
    const completedTopics = await db.userProgress.getCompletedTopics(
      userId,
      learningPathId
    );
    return completedTopics.map((progress) => progress.topic_id);
  } catch (error) {
    console.error("Error fetching completed topic IDs:", error);
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
    progress?.filter(
      (p: UserProgress) => p.status === "completed" || p.status === "mastered"
    ).length || 0;
  const overallProgress = Math.round((completedLessons / totalTopics) * 100);

  return {
    totalTopics,
    completedLessons,
    overallProgress
  };
}

/**
 * Determine topic status based on completed topic IDs and sequential learning
 */
export function getTopicStatus(
  topicId: string,
  topicIndex: number,
  completedTopicIds: string[],
  allTopicIds: string[]
): {
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
} {
  // Check if this topic is completed
  const isCompleted = completedTopicIds.includes(topicId);

  // Find the last completed topic in sequence
  let lastCompletedIndex = -1;
  for (let i = 0; i < allTopicIds.length; i++) {
    if (completedTopicIds.includes(allTopicIds[i])) {
      lastCompletedIndex = i;
    } else {
      // Stop at first non-completed topic (sequential learning)
      break;
    }
  }

  // Current topic is the one right after the last completed
  const isCurrent = topicIndex === lastCompletedIndex + 1;

  // Locked if it's beyond the current topic
  const isLocked = topicIndex > lastCompletedIndex + 1;

  return {
    isCompleted,
    isCurrent,
    isLocked
  };
}
