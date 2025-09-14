// Placement test model - handles placement questions and responses
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from '../base-model';
import { 
  PlacementQuestion, 
  CreatePlacementQuestionData, 
  PlacementResponse,
  CreatePlacementResponseData,
  DifficultyLevel,
  QueryOptions,
  PaginatedResult 
} from '../types';

export class PlacementQuestionModel extends BaseModel<
  PlacementQuestion, 
  CreatePlacementQuestionData, 
  Partial<CreatePlacementQuestionData>
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'placement_questions');
  }

  /**
   * Create a placement question with validation
   */
  async create(questionData: CreatePlacementQuestionData): Promise<PlacementQuestion> {
    this.validateRequired(questionData, [
      'question', 
      'options', 
      'correct_answer', 
      'difficulty_level', 
      'points', 
      'explanation'
    ]);

    this.validateQuestionData(questionData);

    const sanitizedData = this.sanitizeData({
      ...questionData,
      options: JSON.stringify(questionData.options),
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get questions by difficulty level
   */
  async findByDifficulty(
    difficulty: DifficultyLevel, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<PlacementQuestion>> {
    return this.findAll({ difficulty_level: difficulty }, options);
  }

  /**
   * Get random questions for placement test
   */
  async getRandomQuestions(
    count: number = 20,
    difficultyDistribution?: {
      beginner: number;
      intermediate: number;
      advanced: number;
    }
  ): Promise<PlacementQuestion[]> {
    try {
      const questions: PlacementQuestion[] = [];
      
      if (difficultyDistribution) {
        // Get questions with specific distribution
        for (const [difficulty, questionCount] of Object.entries(difficultyDistribution)) {
          if (questionCount > 0) {
            const { data } = await this.supabase
              .from(this.tableName)
              .select('*')
              .eq('difficulty_level', difficulty)
              .order('created_at', { ascending: false })
              .limit(questionCount * 2); // Get more to randomize

            if (data && data.length > 0) {
              // Randomize and take required count
              const shuffled = data.sort(() => 0.5 - Math.random());
              questions.push(...shuffled.slice(0, questionCount).map(this.parseQuestion));
            }
          }
        }
      } else {
        // Get random questions across all difficulties
        const { data } = await this.supabase
          .from(this.tableName)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(count * 2); // Get more to randomize

        if (data && data.length > 0) {
          const shuffled = data.sort(() => 0.5 - Math.random());
          questions.push(...shuffled.slice(0, count).map(this.parseQuestion));
        }
      }

      return questions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get questions by IDs
   */
  async findByIds(ids: string[]): Promise<PlacementQuestion[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', ids);

      if (error) {
        throw this.handleError(error);
      }

      return (data || []).map(this.parseQuestion);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Clear all questions (for seeding)
   */
  async clearAll(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .neq('id', 'never-match'); // Delete all rows

      if (error) {
        throw this.handleError(error);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk insert questions
   */
  async bulkInsert(questions: CreatePlacementQuestionData[]): Promise<PlacementQuestion[]> {
    const sanitizedQuestions = questions.map(q => ({
      ...q,
      created_at: new Date().toISOString()
    }));

    return super.createMany(sanitizedQuestions);
  }

  /**
   * Parse question data (convert JSON strings back to arrays)
   */
  private parseQuestion(questionData: any): PlacementQuestion {
    return {
      ...questionData,
      options: typeof questionData.options === 'string' 
        ? JSON.parse(questionData.options) 
        : questionData.options
    };
  }

  /**
   * Validate question data
   */
  private validateQuestionData(questionData: CreatePlacementQuestionData): void {
    if (!Array.isArray(questionData.options) || questionData.options.length < 2) {
      throw new Error('Question must have at least 2 options');
    }

    if (!questionData.options.includes(questionData.correct_answer)) {
      throw new Error('Correct answer must be one of the provided options');
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(questionData.difficulty_level)) {
      throw new Error('Invalid difficulty level');
    }

    if (questionData.points <= 0) {
      throw new Error('Points must be greater than 0');
    }
  }
}

export class PlacementResponseModel extends BaseModel<
  PlacementResponse, 
  CreatePlacementResponseData, 
  Partial<CreatePlacementResponseData>
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'placement_responses');
  }

  /**
   * Create a placement response with validation
   */
  async create(responseData: CreatePlacementResponseData): Promise<PlacementResponse> {
    this.validateRequired(responseData, ['user_id', 'question_id', 'selected_answer']);

    const sanitizedData = this.sanitizeData({
      ...responseData,
      response_time: responseData.response_time || 0,
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's responses for a specific test session
   */
  async getUserResponses(
    userId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<PlacementResponse>> {
    return this.findAll({ user_id: userId }, {
      ...options,
      orderBy: 'created_at',
      orderDirection: 'desc'
    });
  }

  /**
   * Get responses with question details
   */
  async getResponsesWithQuestions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          placement_questions (
            question,
            correct_answer,
            difficulty_level,
            points,
            explanation
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw this.handleError(error);
      }

      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent responses for activity feed
   */
  async getRecentResponses(
    userId: string, 
    limit: number = 5
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          placement_questions (question)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw this.handleError(error);
      }

      return data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate user's placement test results
   */
  async calculateResults(userId: string): Promise<{
    totalScore: number;
    maxScore: number;
    correctAnswers: number;
    totalQuestions: number;
    averageResponseTime: number;
    difficultyBreakdown: Record<DifficultyLevel, { correct: number; total: number }>;
  }> {
    try {
      const responses = await this.getResponsesWithQuestions(userId);
      
      let totalScore = 0;
      let maxScore = 0;
      let correctAnswers = 0;
      let totalResponseTime = 0;
      const difficultyBreakdown: Record<DifficultyLevel, { correct: number; total: number }> = {
        beginner: { correct: 0, total: 0 },
        intermediate: { correct: 0, total: 0 },
        advanced: { correct: 0, total: 0 }
      };

      responses.forEach(response => {
        const question = response.placement_questions;
        if (!question) return;

        const isCorrect = response.selected_answer === question.correct_answer;
        const difficulty = question.difficulty_level as DifficultyLevel;

        if (isCorrect) {
          totalScore += question.points;
          correctAnswers++;
          difficultyBreakdown[difficulty].correct++;
        }

        maxScore += question.points;
        totalResponseTime += response.response_time || 0;
        difficultyBreakdown[difficulty].total++;
      });

      return {
        totalScore,
        maxScore,
        correctAnswers,
        totalQuestions: responses.length,
        averageResponseTime: responses.length > 0 ? totalResponseTime / responses.length : 0,
        difficultyBreakdown
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk insert responses
   */
  async bulkInsertResponses(responses: CreatePlacementResponseData[]): Promise<PlacementResponse[]> {
    const sanitizedResponses = responses.map(r => ({
      ...r,
      response_time: r.response_time || 0,
      created_at: new Date().toISOString()
    }));

    return super.createMany(sanitizedResponses);
  }

  /**
   * Delete user's responses (for retaking test)
   */
  async deleteUserResponses(userId: string): Promise<void> {
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
