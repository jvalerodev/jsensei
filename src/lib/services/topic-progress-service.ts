import { getDatabase } from "@/lib/database/server";
import type {
  UserProgress,
  Content,
  UserInteraction
} from "@/lib/database/types";

interface CreateTopicProgressParams {
  userId: string;
  learningPathId: string;
  topicId: string;
}

interface CalculateProgressResult {
  score: number;
  attempts: number;
  timeSpent: number;
  startedAt: string;
  recentScores: number[];
}

/**
 * Service for managing user progress on topics
 * Calculates progress from user interactions and saves to database
 */
export class TopicProgressService {
  /**
   * Calculate progress metrics from user interactions for a specific topic
   */
  static async calculateProgressFromInteractions({
    userId,
    topicId
  }: {
    userId: string;
    topicId: string;
  }): Promise<CalculateProgressResult | null> {
    const db = await getDatabase();

    // Get all exercise content items for this topic
    const contentResult = await db.contents.findAll(
      {
        topic_id: topicId,
        content_type: "exercise",
        is_active: true
      },
      { orderBy: "order_index", orderDirection: "asc" }
    );

    if (!contentResult.data || contentResult.data.length === 0) {
      console.log(
        `[TopicProgressService] No exercises found for topic ${topicId}`
      );
      return null;
    }

    const exerciseContentIds = contentResult.data.map((c: Content) => c.id);
    console.log(
      `[TopicProgressService] Found ${exerciseContentIds.length} exercises for topic ${topicId}`
    );

    // Get all interactions for these exercises
    const allInteractions = [];
    for (const contentId of exerciseContentIds) {
      const attempts = await db.userInteractions.getExerciseAttempts(
        userId,
        contentId
      );
      allInteractions.push(...attempts);
    }

    if (allInteractions.length === 0) {
      console.log(
        `[TopicProgressService] No interactions found for user ${userId} in topic ${topicId}`
      );
      return null;
    }

    // Sort interactions by creation date
    allInteractions.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Calculate metrics
    const scores = allInteractions
      .filter((i) => i.score !== null && i.score !== undefined)
      .map((i) => i.score!);

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    const totalAttempts = allInteractions.length;

    const totalTimeSpent = allInteractions
      .filter((i) => i.response_time !== null && i.response_time !== undefined)
      .reduce((sum, i) => sum + (i.response_time || 0), 0);

    const startedAt = allInteractions[0].created_at;
    const recentScores = scores; // Already ordered by date

    return {
      score: Math.round(averageScore * 100) / 100,
      attempts: totalAttempts,
      timeSpent: totalTimeSpent,
      startedAt,
      recentScores
    };
  }

  /**
   * Check if all exercises in a topic are completed correctly
   * An exercise is ONLY considered completed when answered correctly,
   * regardless of attempts. If max attempts reached without correct answer,
   * user must regenerate the exercise and try again.
   */
  static async areAllExercisesCompleted({
    userId,
    topicId
  }: {
    userId: string;
    topicId: string;
  }): Promise<boolean> {
    const db = await getDatabase();

    // Get all exercise content items for this topic
    const contentResult = await db.contents.findAll(
      {
        topic_id: topicId,
        content_type: "exercise",
        is_active: true
      },
      { orderBy: "order_index", orderDirection: "asc" }
    );

    if (!contentResult.data || contentResult.data.length === 0) {
      return false;
    }

    // Check each exercise
    for (const exercise of contentResult.data) {
      const attempts = await db.userInteractions.getExerciseAttempts(
        userId,
        exercise.id
      );

      // Exercise is ONLY completed if answered correctly
      const isCompleted = attempts.some(
        (attempt: UserInteraction) => attempt.is_correct === true
      );

      if (!isCompleted) {
        // This exercise has not been answered correctly yet
        console.log(
          `[TopicProgressService] Exercise ${exercise.id} not completed correctly yet`
        );
        return false;
      }
    }

    // All exercises are completed correctly
    console.log(
      `[TopicProgressService] All exercises for topic ${topicId} completed correctly`
    );
    return true;
  }

  /**
   * Create or update topic progress record
   */
  static async createTopicProgress({
    userId,
    learningPathId,
    topicId
  }: CreateTopicProgressParams): Promise<UserProgress | null> {
    const db = await getDatabase();

    // Calculate progress from interactions
    const progressMetrics = await this.calculateProgressFromInteractions({
      userId,
      topicId
    });

    if (!progressMetrics) {
      throw new Error("No interactions found to calculate progress");
    }

    // Check if progress record already exists
    const existingProgress = await db.userProgress.findByUserAndTopic(
      userId,
      learningPathId,
      topicId
    );

    const status =
      progressMetrics.score >= 90
        ? "mastered"
        : progressMetrics.score >= 70
        ? "completed"
        : "in_progress";

    if (existingProgress) {
      console.log(
        `[TopicProgressService] Updating existing progress for topic ${topicId}`
      );

      // Update existing record
      return db.userProgress.update(existingProgress.id, {
        score: progressMetrics.score,
        attempts: progressMetrics.attempts,
        time_spent: progressMetrics.timeSpent,
        recent_scores: progressMetrics.recentScores,
        started_at: progressMetrics.startedAt,
        status,
        completed_at: new Date().toISOString()
      });
    }

    // Create new progress record
    console.log(
      `[TopicProgressService] Creating new progress record for topic ${topicId}`
    );

    return db.userProgress.create({
      user_id: userId,
      learning_path_id: learningPathId,
      topic_id: topicId,
      score: progressMetrics.score,
      attempts: progressMetrics.attempts,
      time_spent: progressMetrics.timeSpent,
      recent_scores: progressMetrics.recentScores,
      started_at: progressMetrics.startedAt,
      status,
      completed_at: new Date().toISOString()
    });
  }

  /**
   * Get existing progress for a topic
   */
  static async getTopicProgress({
    userId,
    learningPathId,
    topicId
  }: CreateTopicProgressParams): Promise<UserProgress | null> {
    const db = await getDatabase();
    return db.userProgress.findByUserAndTopic(userId, learningPathId, topicId);
  }
}
