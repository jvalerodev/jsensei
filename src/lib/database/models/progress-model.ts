// Progress model - handles user progress tracking
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from '../base-model';
import { 
  UserProgress, 
  CreateUserProgressData, 
  UpdateUserProgressData,
  QueryOptions,
  PaginatedResult 
} from '../types';

export class UserProgressModel extends BaseModel<UserProgress, CreateUserProgressData, UpdateUserProgressData> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'user_progress');
  }

  /**
   * Create user progress with validation
   */
  async create(progressData: CreateUserProgressData): Promise<UserProgress> {
    this.validateRequired(progressData, ['user_id', 'lesson_id']);

    const sanitizedData = this.sanitizeData({
      ...progressData,
      status: progressData.status || 'not_started',
      score: progressData.score || 0,
      attempts: progressData.attempts || 0,
      time_spent: progressData.time_spent || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Update progress for a user and lesson
   */
  async updateProgress(
    userId: string, 
    lessonId: string, 
    updateData: UpdateUserProgressData
  ): Promise<UserProgress | null> {
    try {
      // First try to find existing progress
      const existing = await this.findUserLessonProgress(userId, lessonId);
      
      if (existing) {
        // Update existing progress
        return this.update(existing.id, updateData);
      } else {
        // Create new progress record
        return this.create({
          user_id: userId,
          lesson_id: lessonId,
          status: updateData.status || 'not_started',
          score: updateData.score || 0,
          attempts: updateData.attempts || 0,
          time_spent: updateData.time_spent || 0
        });
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's progress for a specific lesson
   */
  async findUserLessonProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
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
    return this.findAll({ user_id: userId }, {
      ...options,
      orderBy: options.orderBy || 'updated_at',
      orderDirection: options.orderDirection || 'desc'
    });
  }

  /**
   * Get completed lessons for a user
   */
  async getCompletedLessons(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });

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
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('updated_at', { ascending: false });

      if (error) {
        throw this.handleError(error);
      }

      return (data || []) as UserProgress[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add time spent on a lesson
   */
  async addTimeSpent(
    userId: string, 
    lessonId: string, 
    timeSpent: number
  ): Promise<UserProgress | null> {
    try {
      const existing = await this.findUserLessonProgress(userId, lessonId);
      
      if (existing) {
        return this.update(existing.id, {
          time_spent: existing.time_spent + timeSpent
        });
      } else {
        return this.create({
          user_id: userId,
          lesson_id: lessonId,
          time_spent: timeSpent,
          status: 'in_progress'
        });
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete a lesson
   */
  async completeLesson(
    userId: string, 
    lessonId: string, 
    score: number
  ): Promise<UserProgress | null> {
    return this.updateProgress(userId, lessonId, {
      status: 'completed',
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
      const completedLessons = data.filter(p => p.status === 'completed').length;
      const inProgressLessons = data.filter(p => p.status === 'in_progress').length;
      const totalTimeSpent = data.reduce((sum, p) => sum + p.time_spent, 0);
      const completedData = data.filter(p => p.status === 'completed' && p.score > 0);
      const averageScore = completedData.length > 0 
        ? completedData.reduce((sum, p) => sum + p.score, 0) / completedData.length 
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
  async getLeaderboard(limit: number = 10): Promise<Array<{
    user_id: string;
    averageScore: number;
    totalTimeSpent: number;
    completedLessons: number;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('user_id, score, time_spent, status');

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
        
        if (progress.status === 'completed') {
          acc[userId].completedLessons++;
        }

        return acc;
      }, {} as Record<string, any>);

      // Calculate average score and sort
      const leaderboard = Object.values(userStats)
        .map((stats: any) => ({
          user_id: stats.user_id,
          averageScore: stats.lessonCount > 0 ? Math.round((stats.totalScore / stats.lessonCount) * 100) / 100 : 0,
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
  ): Promise<Array<{
    date: string;
    averageScore: number;
    timeSpent: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('updated_at, score, time_spent')
        .eq('user_id', userId)
        .gte('updated_at', startDate.toISOString())
        .order('updated_at', { ascending: true });

      if (error) {
        throw this.handleError(error);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group by date and calculate daily stats
      const dailyStats = data.reduce((acc, progress) => {
        const date = new Date(progress.updated_at).toISOString().split('T')[0];
        
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
        averageScore: stats.count > 0 ? Math.round((stats.totalScore / stats.count) * 100) / 100 : 0,
        timeSpent: stats.timeSpent
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset progress for a lesson
   */
  async resetLessonProgress(userId: string, lessonId: string): Promise<boolean> {
    try {
      const existing = await this.findUserLessonProgress(userId, lessonId);
      
      if (existing) {
        await this.update(existing.id, {
          status: 'not_started',
          score: 0,
          attempts: 0,
          time_spent: 0,
          completed_at: undefined,
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
        .eq('user_id', userId);

      if (error) {
        throw this.handleError(error);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
