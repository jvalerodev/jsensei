// Lesson model - handles learning content and lessons
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from '../base-model';
import { 
  Lesson, 
  CreateLessonData, 
  UpdateLessonData,
  DifficultyLevel,
  QueryOptions,
  PaginatedResult 
} from '../types';

export class LessonModel extends BaseModel<Lesson, CreateLessonData, UpdateLessonData> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'lessons');
  }

  /**
   * Create a lesson with validation
   */
  async create(lessonData: CreateLessonData): Promise<Lesson> {
    this.validateRequired(lessonData, [
      'title', 
      'description', 
      'content', 
      'difficulty_level', 
      'order_index'
    ]);

    this.validateLessonData(lessonData);

    const sanitizedData = this.sanitizeData({
      ...lessonData,
      content: JSON.stringify(lessonData.content),
      estimated_duration: lessonData.estimated_duration || 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Update lesson with content parsing
   */
  async update(id: string, updateData: UpdateLessonData): Promise<Lesson | null> {
    const sanitizedData = this.sanitizeData({
      ...updateData,
      content: updateData.content ? JSON.stringify(updateData.content) : undefined
    });

    const result = await super.update(id, sanitizedData);
    return result ? this.parseLesson(result) : null;
  }

  /**
   * Get lessons by difficulty level
   */
  async findByDifficulty(
    difficulty: DifficultyLevel, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Lesson>> {
    const result = await this.findAll({ difficulty_level: difficulty }, {
      ...options,
      orderBy: options.orderBy || 'order_index',
      orderDirection: options.orderDirection || 'asc'
    });

    return {
      ...result,
      data: result.data.map(this.parseLesson)
    };
  }

  /**
   * Get lessons ordered by sequence
   */
  async getLessonsInOrder(
    difficulty?: DifficultyLevel,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Lesson>> {
    const filters = difficulty ? { difficulty_level: difficulty } : {};
    
    const result = await this.findAll(filters, {
      ...options,
      orderBy: 'order_index',
      orderDirection: 'asc'
    });

    return {
      ...result,
      data: result.data.map(this.parseLesson)
    };
  }

  /**
   * Get next lesson in sequence
   */
  async getNextLesson(
    currentOrderIndex: number, 
    difficulty: DifficultyLevel
  ): Promise<Lesson | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('difficulty_level', difficulty)
        .gt('order_index', currentOrderIndex)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No next lesson
        }
        throw this.handleError(error);
      }

      return this.parseLesson(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get previous lesson in sequence
   */
  async getPreviousLesson(
    currentOrderIndex: number, 
    difficulty: DifficultyLevel
  ): Promise<Lesson | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('difficulty_level', difficulty)
        .lt('order_index', currentOrderIndex)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No previous lesson
        }
        throw this.handleError(error);
      }

      return this.parseLesson(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search lessons by title or content
   */
  async searchLessons(
    searchTerm: string, 
    difficulty?: DifficultyLevel,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Lesson>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      } else {
        query = query.order('order_index', { ascending: true });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw this.handleError(error);
      }

      const totalCount = count || 0;
      const hasMore = options.limit ? 
        (options.offset || 0) + (options.limit || 0) < totalCount : 
        false;

      return {
        data: (data || []).map(this.parseLesson),
        count: totalCount,
        hasMore
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get lessons by duration range
   */
  async findByDuration(
    minDuration: number, 
    maxDuration: number,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Lesson>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .gte('estimated_duration', minDuration)
        .lte('estimated_duration', maxDuration);

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      } else {
        query = query.order('estimated_duration', { ascending: true });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw this.handleError(error);
      }

      const totalCount = count || 0;
      const hasMore = options.limit ? 
        (options.offset || 0) + (options.limit || 0) < totalCount : 
        false;

      return {
        data: (data || []).map(this.parseLesson),
        count: totalCount,
        hasMore
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reorder lessons
   */
  async reorderLessons(
    lessonIds: string[], 
    difficulty: DifficultyLevel
  ): Promise<void> {
    try {
      // Update order_index for each lesson
      const updates = lessonIds.map((id, index) => 
        this.update(id, { order_index: index + 1 })
      );

      await Promise.all(updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get lesson statistics
   */
  async getLessonStats(): Promise<{
    totalLessons: number;
    byDifficulty: Record<DifficultyLevel, number>;
    averageDuration: number;
    totalDuration: number;
  }> {
    try {
      const { data } = await this.supabase
        .from(this.tableName)
        .select('difficulty_level, estimated_duration');

      if (!data) {
        return {
          totalLessons: 0,
          byDifficulty: { beginner: 0, intermediate: 0, advanced: 0 },
          averageDuration: 0,
          totalDuration: 0
        };
      }

      const totalLessons = data.length;
      const byDifficulty = data.reduce((acc, lesson) => {
        const difficulty = lesson.difficulty_level as DifficultyLevel;
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {} as Record<DifficultyLevel, number>);

      const totalDuration = data.reduce((sum, lesson) => 
        sum + (lesson.estimated_duration || 0), 0
      );
      const averageDuration = totalLessons > 0 ? totalDuration / totalLessons : 0;

      return {
        totalLessons,
        byDifficulty: {
          beginner: byDifficulty.beginner || 0,
          intermediate: byDifficulty.intermediate || 0,
          advanced: byDifficulty.advanced || 0
        },
        averageDuration: Math.round(averageDuration * 100) / 100,
        totalDuration
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Parse lesson data (convert JSON strings back to objects)
   */
  private parseLesson(lessonData: any): Lesson {
    return {
      ...lessonData,
      content: typeof lessonData.content === 'string' 
        ? JSON.parse(lessonData.content) 
        : lessonData.content
    };
  }

  /**
   * Validate lesson data
   */
  private validateLessonData(lessonData: CreateLessonData): void {
    if (!['beginner', 'intermediate', 'advanced'].includes(lessonData.difficulty_level)) {
      throw new Error('Invalid difficulty level');
    }

    if (lessonData.order_index < 1) {
      throw new Error('Order index must be greater than 0');
    }

    if (lessonData.estimated_duration && lessonData.estimated_duration < 1) {
      throw new Error('Estimated duration must be at least 1 minute');
    }

    if (!lessonData.content || typeof lessonData.content !== 'object') {
      throw new Error('Lesson content must be a valid object');
    }
  }

  /**
   * Override findById to parse content
   */
  async findById(id: string): Promise<Lesson | null> {
    const lesson = await super.findById(id);
    return lesson ? this.parseLesson(lesson) : null;
  }

  /**
   * Override findAll to parse content
   */
  async findAll(
    filters: Record<string, any> = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Lesson>> {
    const result = await super.findAll(filters, options);
    return {
      ...result,
      data: result.data.map(this.parseLesson)
    };
  }
}
