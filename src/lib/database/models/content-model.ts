// Content model - handles AI generated content and exercises
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from '../base-model';
import { 
  GeneratedContent, 
  CreateGeneratedContentData, 
  GeneratedExercise,
  CreateGeneratedExerciseData,
  ExerciseEvaluation,
  CreateExerciseEvaluationData,
  UserResponse,
  CreateUserResponseData,
  SkillLevel,
  QueryOptions,
  PaginatedResult 
} from '../types';

export class GeneratedContentModel extends BaseModel<GeneratedContent, CreateGeneratedContentData, Partial<CreateGeneratedContentData>> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'generated_content');
  }

  /**
   * Create generated content with validation
   */
  async create(contentData: CreateGeneratedContentData): Promise<GeneratedContent> {
    this.validateRequired(contentData, ['user_id', 'topic', 'skill_level', 'content', 'content_type']);

    const sanitizedData = this.sanitizeData({
      ...contentData,
      content: JSON.stringify(contentData.content),
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's generated content
   */
  async getUserContent(
    userId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<GeneratedContent>> {
    const result = await this.findAll({ user_id: userId }, {
      ...options,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc'
    });

    return {
      ...result,
      data: result.data.map(this.parseContent)
    };
  }

  /**
   * Get content by topic and skill level
   */
  async getContentByTopicAndLevel(
    topic: string, 
    skillLevel: SkillLevel,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<GeneratedContent>> {
    const result = await this.findAll({ 
      topic, 
      skill_level: skillLevel 
    }, options);

    return {
      ...result,
      data: result.data.map(this.parseContent)
    };
  }

  /**
   * Get content by type
   */
  async getContentByType(
    contentType: string,
    userId?: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<GeneratedContent>> {
    const filters: any = { content_type: contentType };
    if (userId) {
      filters.user_id = userId;
    }

    const result = await this.findAll(filters, options);

    return {
      ...result,
      data: result.data.map(this.parseContent)
    };
  }

  /**
   * Parse content data
   */
  private parseContent(contentData: any): GeneratedContent {
    return {
      ...contentData,
      content: typeof contentData.content === 'string' 
        ? JSON.parse(contentData.content) 
        : contentData.content
    };
  }

  /**
   * Override findById to parse content
   */
  async findById(id: string): Promise<GeneratedContent | null> {
    const content = await super.findById(id);
    return content ? this.parseContent(content) : null;
  }
}

export class GeneratedExerciseModel extends BaseModel<GeneratedExercise, CreateGeneratedExerciseData, Partial<CreateGeneratedExerciseData>> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'generated_exercises');
  }

  /**
   * Create generated exercises with validation
   */
  async create(exerciseData: CreateGeneratedExerciseData): Promise<GeneratedExercise> {
    this.validateRequired(exerciseData, ['user_id', 'topic', 'skill_level', 'exercises']);

    const sanitizedData = this.sanitizeData({
      ...exerciseData,
      exercises: JSON.stringify(exerciseData.exercises),
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's generated exercises
   */
  async getUserExercises(
    userId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<GeneratedExercise>> {
    const result = await this.findAll({ user_id: userId }, {
      ...options,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc'
    });

    return {
      ...result,
      data: result.data.map(this.parseExercise)
    };
  }

  /**
   * Get exercises by topic and skill level
   */
  async getExercisesByTopicAndLevel(
    topic: string, 
    skillLevel: SkillLevel,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<GeneratedExercise>> {
    const result = await this.findAll({ 
      topic, 
      skill_level: skillLevel 
    }, options);

    return {
      ...result,
      data: result.data.map(this.parseExercise)
    };
  }

  /**
   * Parse exercise data
   */
  private parseExercise(exerciseData: any): GeneratedExercise {
    return {
      ...exerciseData,
      exercises: typeof exerciseData.exercises === 'string' 
        ? JSON.parse(exerciseData.exercises) 
        : exerciseData.exercises
    };
  }

  /**
   * Override findById to parse exercises
   */
  async findById(id: string): Promise<GeneratedExercise | null> {
    const exercise = await super.findById(id);
    return exercise ? this.parseExercise(exercise) : null;
  }
}

export class ExerciseEvaluationModel extends BaseModel<ExerciseEvaluation, CreateExerciseEvaluationData, Partial<CreateExerciseEvaluationData>> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'exercise_evaluations');
  }

  /**
   * Create exercise evaluation with validation
   */
  async create(evaluationData: CreateExerciseEvaluationData): Promise<ExerciseEvaluation> {
    this.validateRequired(evaluationData, [
      'user_id', 
      'exercise_id', 
      'user_answer', 
      'is_correct', 
      'feedback', 
      'score'
    ]);

    const sanitizedData = this.sanitizeData({
      ...evaluationData,
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's exercise evaluations
   */
  async getUserEvaluations(
    userId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<ExerciseEvaluation>> {
    return this.findAll({ user_id: userId }, {
      ...options,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc'
    });
  }

  /**
   * Get evaluations for a specific exercise
   */
  async getExerciseEvaluations(
    exerciseId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<ExerciseEvaluation>> {
    return this.findAll({ exercise_id: exerciseId }, options);
  }

  /**
   * Get user's performance statistics
   */
  async getUserPerformanceStats(userId: string): Promise<{
    totalAttempts: number;
    correctAnswers: number;
    averageScore: number;
    successRate: number;
  }> {
    try {
      const { data } = await this.getUserEvaluations(userId);

      if (!data || data.length === 0) {
        return {
          totalAttempts: 0,
          correctAnswers: 0,
          averageScore: 0,
          successRate: 0
        };
      }

      const totalAttempts = data.length;
      const correctAnswers = data.filter(e => e.is_correct).length;
      const averageScore = data.reduce((sum, e) => sum + e.score, 0) / totalAttempts;
      const successRate = (correctAnswers / totalAttempts) * 100;

      return {
        totalAttempts,
        correctAnswers,
        averageScore: Math.round(averageScore * 100) / 100,
        successRate: Math.round(successRate * 100) / 100
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export class UserResponseModel extends BaseModel<UserResponse, CreateUserResponseData, Partial<CreateUserResponseData>> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'user_responses');
  }

  /**
   * Create user response with validation
   */
  async create(responseData: CreateUserResponseData): Promise<UserResponse> {
    this.validateRequired(responseData, [
      'user_id', 
      'exercise_id', 
      'user_answer', 
      'is_correct', 
      'score'
    ]);

    const sanitizedData = this.sanitizeData({
      ...responseData,
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's responses
   */
  async getUserResponses(
    userId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<UserResponse>> {
    return this.findAll({ user_id: userId }, {
      ...options,
      orderBy: options.orderBy || 'created_at',
      orderDirection: options.orderDirection || 'desc'
    });
  }

  /**
   * Get responses for a specific exercise
   */
  async getExerciseResponses(
    exerciseId: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<UserResponse>> {
    return this.findAll({ exercise_id: exerciseId }, options);
  }

  /**
   * Get user's latest response for an exercise
   */
  async getLatestUserResponse(
    userId: string, 
    exerciseId: string
  ): Promise<UserResponse | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw this.handleError(error);
      }

      return data as UserResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's response statistics
   */
  async getUserResponseStats(userId: string): Promise<{
    totalResponses: number;
    correctResponses: number;
    averageScore: number;
    successRate: number;
    recentActivity: UserResponse[];
  }> {
    try {
      const { data } = await this.getUserResponses(userId);

      if (!data || data.length === 0) {
        return {
          totalResponses: 0,
          correctResponses: 0,
          averageScore: 0,
          successRate: 0,
          recentActivity: []
        };
      }

      const totalResponses = data.length;
      const correctResponses = data.filter(r => r.is_correct).length;
      const averageScore = data.reduce((sum, r) => sum + r.score, 0) / totalResponses;
      const successRate = (correctResponses / totalResponses) * 100;
      const recentActivity = data.slice(0, 5);

      return {
        totalResponses,
        correctResponses,
        averageScore: Math.round(averageScore * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        recentActivity
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
