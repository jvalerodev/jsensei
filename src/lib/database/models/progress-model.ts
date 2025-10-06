// Progress model - handles user progress tracking
import { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "../base-model";
import {
  UserProgress,
  CreateUserProgressData,
  UpdateUserProgressData,
  QueryOptions,
  PaginatedResult
} from "../types";

export class UserProgressModel extends BaseModel<
  UserProgress,
  CreateUserProgressData,
  UpdateUserProgressData
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "user_progress");
  }

  /**
   * Create user progress with validation
   */
  async create(progressData: CreateUserProgressData): Promise<UserProgress> {
    this.validateRequired(progressData, [
      "user_id",
      "learning_path_id",
      "topic_id"
    ]);

    const sanitizedData = this.sanitizeData({
      ...progressData,
      status: progressData.status || "not_started",
      score: progressData.score || 0,
      attempts: progressData.attempts || 0,
      time_spent: progressData.time_spent || 0,
      recent_scores: progressData.recent_scores || [],
      last_interaction: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Update progress for a user and learning path topic
   */
  async updateProgress(
    userId: string,
    learningPathId: string,
    topic: string,
    updateData: UpdateUserProgressData
  ): Promise<UserProgress | null> {
    try {
      // Try to find existing progress record
      const existingProgress = await this.findByUserAndTopic(
        userId,
        learningPathId,
        topic
      );

      if (existingProgress) {
        // Update existing record
        const updatedData = {
          ...updateData,
          last_interaction: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return this.update(existingProgress.id, updatedData);
      } else {
        // Create new progress record
        return this.create({
          user_id: userId,
          learning_path_id: learningPathId,
          topic_id: topic,
          ...updateData
        });
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's progress for a specific topic in a learning path
   */
  async findByUserAndTopic(
    userId: string,
    learningPathId: string,
    topicId: string
  ): Promise<UserProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .eq("learning_path_id", learningPathId)
        .eq("topic_id", topicId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw this.handleError(error);
      }

      return data as UserProgress;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(
    userId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<UserProgress>> {
    return this.findAll(
      { user_id: userId },
      {
        ...options,
        orderBy: options.orderBy || "updated_at",
        orderDirection: options.orderDirection || "desc"
      }
    );
  }

  /**
   * Get completed topics for a user
   */
  async getCompletedTopics(
    userId: string,
    learningPathId?: string
  ): Promise<UserProgress[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .not("completed_at", "is", null)
        .order("updated_at", { ascending: false });

      if (learningPathId) {
        query = query.eq("learning_path_id", learningPathId);
      }

      const { data, error } = await query;

      if (error) {
        throw this.handleError(error);
      }

      return (data || []) as UserProgress[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get in-progress lessons for a user
   */
  async getInProgressLessons(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .eq("status", "in_progress")
        .order("updated_at", { ascending: false });

      if (error) {
        throw this.handleError(error);
      }

      return (data || []) as UserProgress[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add time spent on a topic
   */
  async addTimeSpent(
    userId: string,
    learningPathId: string,
    topic: string,
    timeSpent: number
  ): Promise<UserProgress | null> {
    try {
      const existing = await this.findByUserAndTopic(
        userId,
        learningPathId,
        topic
      );

      if (existing) {
        return this.update(existing.id, {
          time_spent: existing.time_spent + timeSpent,
          last_interaction: new Date().toISOString()
        });
      } else {
        return this.create({
          user_id: userId,
          learning_path_id: learningPathId,
          topic_id: topic,
          time_spent: timeSpent,
          status: "in_progress"
        });
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete a topic
   */
  async completeTopic(
    userId: string,
    learningPathId: string,
    topic: string,
    score: number
  ): Promise<UserProgress | null> {
    return this.updateProgress(userId, learningPathId, topic, {
      status: "completed",
      score: score,
      completed_at: new Date().toISOString()
    });
  }

  /**
   * Get user's overall progress statistics
   */
  async getUserStats(userId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    totalTimeSpent: number;
    averageScore: number;
    lastActivity: string | null;
  }> {
    try {
      const { data } = await this.getUserProgress(userId);

      if (!data || data.length === 0) {
        return {
          totalLessons: 0,
          completedLessons: 0,
          inProgressLessons: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          lastActivity: null
        };
      }

      const totalLessons = data.length;
      const completedLessons = data.filter(
        (p) => p.status === "completed"
      ).length;
      const inProgressLessons = data.filter(
        (p) => p.status === "in_progress"
      ).length;
      const totalTimeSpent = data.reduce((sum, p) => sum + p.time_spent, 0);
      const completedData = data.filter(
        (p) => p.status === "completed" && p.score > 0
      );
      const averageScore =
        completedData.length > 0
          ? completedData.reduce((sum, p) => sum + p.score, 0) /
            completedData.length
          : 0;
      const lastActivity = data.length > 0 ? data[0].updated_at : null;

      return {
        totalLessons,
        completedLessons,
        inProgressLessons,
        totalTimeSpent,
        averageScore: Math.round(averageScore * 100) / 100,
        lastActivity
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit: number = 10): Promise<
    Array<{
      user_id: string;
      averageScore: number;
      totalTimeSpent: number;
      completedLessons: number;
    }>
  > {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("user_id, score, time_spent, status");

      if (error) {
        throw this.handleError(error);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group by user and calculate stats
      const userStats = data.reduce((acc, progress) => {
        const userId = progress.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            totalScore: 0,
            totalTimeSpent: 0,
            completedLessons: 0,
            lessonCount: 0
          };
        }

        acc[userId].totalScore += progress.score;
        acc[userId].totalTimeSpent += progress.time_spent;
        acc[userId].lessonCount++;

        if (progress.status === "completed") {
          acc[userId].completedLessons++;
        }

        return acc;
      }, {} as Record<string, any>);

      // Calculate average score and sort
      const leaderboard = Object.values(userStats)
        .map((stats: any) => ({
          user_id: stats.user_id,
          averageScore:
            stats.lessonCount > 0
              ? Math.round((stats.totalScore / stats.lessonCount) * 100) / 100
              : 0,
          totalTimeSpent: stats.totalTimeSpent,
          completedLessons: stats.completedLessons
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, limit);

      return leaderboard;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get progress trends for a user
   */
  async getProgressTrends(
    userId: string,
    days: number = 30
  ): Promise<
    Array<{
      date: string;
      averageScore: number;
      timeSpent: number;
    }>
  > {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("updated_at, score, time_spent")
        .eq("user_id", userId)
        .gte("updated_at", startDate.toISOString())
        .order("updated_at", { ascending: true });

      if (error) {
        throw this.handleError(error);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group by date and calculate daily stats
      const dailyStats = data.reduce((acc, progress) => {
        const date = new Date(progress.updated_at).toISOString().split("T")[0];

        if (!acc[date]) {
          acc[date] = {
            date,
            totalScore: 0,
            timeSpent: 0,
            count: 0
          };
        }

        acc[date].totalScore += progress.score;
        acc[date].timeSpent += progress.time_spent;
        acc[date].count++;

        return acc;
      }, {} as Record<string, any>);

      // Calculate averages
      return Object.values(dailyStats).map((stats: any) => ({
        date: stats.date,
        averageScore:
          stats.count > 0
            ? Math.round((stats.totalScore / stats.count) * 100) / 100
            : 0,
        timeSpent: stats.timeSpent
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset progress for a topic
   */
  async resetTopicProgress(
    userId: string,
    learningPathId: string,
    topic: string
  ): Promise<boolean> {
    try {
      const existing = await this.findByUserAndTopic(
        userId,
        learningPathId,
        topic
      );

      if (existing) {
        await this.update(existing.id, {
          status: "not_started",
          score: 0,
          attempts: 0,
          time_spent: 0,
          recent_scores: [],
          completed_at: undefined,
          last_interaction: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete all progress for a user
   */
  async deleteUserProgress(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq("user_id", userId);

      if (error) {
        throw this.handleError(error);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
