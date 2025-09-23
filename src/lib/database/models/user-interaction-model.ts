// User interaction model v2.1 - handles all user interactions (unified)
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from '../base-model';
import { 
  UserInteraction, 
  CreateUserInteractionData,
  InteractionType,
  QueryOptions,
  PaginatedResult 
} from '../types';

export class UserInteractionModel extends BaseModel<UserInteraction, CreateUserInteractionData, Partial<CreateUserInteractionData>> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'user_interactions');
  }

  /**
   * Create user interaction with validation
   */
  async create(interactionData: CreateUserInteractionData): Promise<UserInteraction> {
    this.validateRequired(interactionData, ['user_id', 'interaction_type']);

    // Validate that either content_id or placement_test_id is provided
    if (!interactionData.content_id && !interactionData.placement_test_id) {
      throw new Error('Either content_id or placement_test_id must be provided');
    }

    const sanitizedData = this.sanitizeData({
      ...interactionData,
      ai_suggestions: interactionData.ai_suggestions || [],
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's interactions
   */
  async getUserInteractions(
    userId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<UserInteraction>> {
    return this.findAll({ user_id: userId }, {
      ...options,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc'
    });
  }

  /**
   * Get interactions by type
   */
  async getInteractionsByType(
    userId: string,
    interactionType: InteractionType,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<UserInteraction>> {
    return this.findAll({ 
      user_id: userId,
      interaction_type: interactionType 
    }, {
      ...options,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc'
    });
  }

  /**
   * Get interactions for specific content
   */
  async getContentInteractions(
    contentId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<UserInteraction>> {
    return this.findAll({ content_id: contentId }, options);
  }

  /**
   * Get placement test interactions
   */
  async getPlacementInteractions(
    userId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<UserInteraction>> {
    return this.findAll({ 
      user_id: userId,
      interaction_type: 'placement_answer'
    }, {
      ...options,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'asc'
    });
  }

  /**
   * Get user's latest interaction for specific content
   */
  async getLatestContentInteraction(
    userId: string, 
    contentId: string
  ): Promise<UserInteraction | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw this.handleError(error);
      }

      return data as UserInteraction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's performance statistics
   */
  async getUserPerformanceStats(userId: string): Promise<{
    totalInteractions: number;
    correctAnswers: number;
    averageScore: number;
    successRate: number;
    interactionsByType: Record<InteractionType, number>;
    recentActivity: UserInteraction[];
  }> {
    try {
      const { data } = await this.getUserInteractions(userId);

      if (!data || data.length === 0) {
        return {
          totalInteractions: 0,
          correctAnswers: 0,
          averageScore: 0,
          successRate: 0,
          interactionsByType: {} as Record<InteractionType, number>,
          recentActivity: []
        };
      }

      const totalInteractions = data.length;
      const answeredInteractions = data.filter(i => i.is_correct !== null && i.is_correct !== undefined);
      const correctAnswers = answeredInteractions.filter(i => i.is_correct).length;
      const scoredInteractions = data.filter(i => i.score !== null && i.score !== undefined);
      const averageScore = scoredInteractions.length > 0 
        ? scoredInteractions.reduce((sum, i) => sum + (i.score || 0), 0) / scoredInteractions.length
        : 0;
      const successRate = answeredInteractions.length > 0 
        ? (correctAnswers / answeredInteractions.length) * 100 
        : 0;

      const interactionsByType = data.reduce((acc, interaction) => {
        acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1;
        return acc;
      }, {} as Record<InteractionType, number>);

      const recentActivity = data.slice(0, 10);

      return {
        totalInteractions,
        correctAnswers,
        averageScore: Math.round(averageScore * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        interactionsByType,
        recentActivity
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get placement test results for user
   */
  async getPlacementTestResults(userId: string): Promise<{
    totalQuestions: number;
    correctAnswers: number;
    totalScore: number;
    averageResponseTime: number;
    topicPerformance: Record<string, { correct: number; total: number; score: number }>;
  }> {
    try {
      const { data: interactions } = await this.getPlacementInteractions(userId);

      if (!interactions || interactions.length === 0) {
        return {
          totalQuestions: 0,
          correctAnswers: 0,
          totalScore: 0,
          averageResponseTime: 0,
          topicPerformance: {}
        };
      }

      // Get placement test details to get topics
      const placementTestIds = interactions
        .map(i => i.placement_test_id)
        .filter(id => id !== null && id !== undefined);

      const { data: placementTests } = await this.supabase
        .from('placement_tests')
        .select('id, topic')
        .in('id', placementTestIds);

      const topicMap = (placementTests || []).reduce((acc, test) => {
        acc[test.id] = test.topic;
        return acc;
      }, {} as Record<string, string>);

      const totalQuestions = interactions.length;
      const correctAnswers = interactions.filter(i => i.is_correct).length;
      const totalScore = interactions.reduce((sum, i) => sum + (i.score || 0), 0);
      const responseTimes = interactions
        .map(i => i.response_time)
        .filter(time => time !== null && time !== undefined);
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      const topicPerformance = interactions.reduce((acc, interaction) => {
        if (!interaction.placement_test_id) return acc;
        
        const topic = topicMap[interaction.placement_test_id] || 'Unknown';
        if (!acc[topic]) {
          acc[topic] = { correct: 0, total: 0, score: 0 };
        }
        
        acc[topic].total += 1;
        if (interaction.is_correct) {
          acc[topic].correct += 1;
        }
        acc[topic].score += interaction.score || 0;
        
        return acc;
      }, {} as Record<string, { correct: number; total: number; score: number }>);

      return {
        totalQuestions,
        correctAnswers,
        totalScore,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        topicPerformance
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Record placement test answer
   */
  async recordPlacementAnswer(
    userId: string,
    placementTestId: string,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    score: number,
    responseTime?: number
  ): Promise<UserInteraction> {
    return this.create({
      user_id: userId,
      placement_test_id: placementTestId,
      interaction_type: 'placement_answer',
      user_answer: userAnswer,
      correct_answer: correctAnswer,
      is_correct: isCorrect,
      score: score,
      response_time: responseTime
    });
  }

  /**
   * Record exercise answer with AI feedback
   */
  async recordExerciseAnswer(
    userId: string,
    contentId: string,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    score: number,
    aiFeedback?: string,
    aiSuggestions?: string[],
    aiExplanation?: string,
    responseTime?: number
  ): Promise<UserInteraction> {
    return this.create({
      user_id: userId,
      content_id: contentId,
      interaction_type: 'exercise_answer',
      user_answer: userAnswer,
      correct_answer: correctAnswer,
      is_correct: isCorrect,
      score: score,
      ai_feedback: aiFeedback,
      ai_suggestions: aiSuggestions || [],
      ai_explanation: aiExplanation,
      response_time: responseTime
    });
  }

  /**
   * Record lesson completion
   */
  async recordLessonCompletion(
    userId: string,
    contentId: string,
    timeSpent?: number
  ): Promise<UserInteraction> {
    return this.create({
      user_id: userId,
      content_id: contentId,
      interaction_type: 'lesson_completion',
      response_time: timeSpent
    });
  }

  /**
   * Get interaction analytics for admin
   */
  async getInteractionAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalInteractions: number;
    interactionsByType: Record<InteractionType, number>;
    dailyInteractions: Array<{ date: string; count: number }>;
    averageScore: number;
    successRate: number;
  }> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('interaction_type, is_correct, score, created_at');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw this.handleError(error);
      }

      const interactions = data || [];
      const totalInteractions = interactions.length;

      const interactionsByType = interactions.reduce((acc, interaction) => {
        acc[interaction.interaction_type as InteractionType] = 
          (acc[interaction.interaction_type as InteractionType] || 0) + 1;
        return acc;
      }, {} as Record<InteractionType, number>);

      const dailyInteractions = interactions.reduce((acc, interaction) => {
        const date = interaction.created_at.split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, [] as Array<{ date: string; count: number }>);

      const scoredInteractions = interactions.filter(i => i.score !== null);
      const averageScore = scoredInteractions.length > 0
        ? scoredInteractions.reduce((sum, i) => sum + i.score, 0) / scoredInteractions.length
        : 0;

      const answeredInteractions = interactions.filter(i => i.is_correct !== null);
      const correctAnswers = answeredInteractions.filter(i => i.is_correct).length;
      const successRate = answeredInteractions.length > 0
        ? (correctAnswers / answeredInteractions.length) * 100
        : 0;

      return {
        totalInteractions,
        interactionsByType,
        dailyInteractions: dailyInteractions.sort((a, b) => a.date.localeCompare(b.date)),
        averageScore: Math.round(averageScore * 100) / 100,
        successRate: Math.round(successRate * 100) / 100
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
