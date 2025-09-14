// User model - handles all user-related database operations
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from '../base-model';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  SkillLevel,
  QueryOptions,
  PaginatedResult 
} from '../types';

export class UserModel extends BaseModel<User, CreateUserData, UpdateUserData> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw this.handleError(error);
      }

      return data as User;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new user with validation
   */
  async create(userData: CreateUserData): Promise<User> {
    this.validateRequired(userData, ['id', 'email']);
    
    const sanitizedData = this.sanitizeData({
      ...userData,
      skill_level: userData.skill_level || 'beginner',
      placement_test_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: UpdateUserData): Promise<User | null> {
    const sanitizedData = this.sanitizeData(updateData);
    return super.update(userId, sanitizedData);
  }

  /**
   * Complete placement test for user
   */
  async completeePlacementTest(
    userId: string, 
    score: number, 
    skillLevel: SkillLevel
  ): Promise<User | null> {
    return this.update(userId, {
      placement_test_completed: true,
      placement_test_score: score,
      skill_level: skillLevel
    });
  }

  /**
   * Update user skill level
   */
  async updateSkillLevel(userId: string, skillLevel: SkillLevel): Promise<User | null> {
    return this.update(userId, { skill_level: skillLevel });
  }

  /**
   * Get users by skill level
   */
  async findBySkillLevel(
    skillLevel: SkillLevel, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<User>> {
    return this.findAll({ skill_level: skillLevel }, options);
  }

  /**
   * Get users who completed placement test
   */
  async findWithCompletedPlacement(
    options: QueryOptions = {}
  ): Promise<PaginatedResult<User>> {
    return this.findAll({ placement_test_completed: true }, options);
  }

  /**
   * Get users who need to take placement test
   */
  async findPendingPlacement(
    options: QueryOptions = {}
  ): Promise<PaginatedResult<User>> {
    return this.findAll({ placement_test_completed: false }, options);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalUsers: number;
    completedPlacement: number;
    averageScore: number;
    userRank?: number;
  }> {
    try {
      // Get total users count
      const totalUsers = await this.count();

      // Get completed placement count
      const completedPlacement = await this.count({ placement_test_completed: true });

      // Get average score
      const { data: scores } = await this.supabase
        .from(this.tableName)
        .select('placement_test_score')
        .not('placement_test_score', 'is', null);

      const averageScore = scores && scores.length > 0 
        ? scores.reduce((sum, user) => sum + (user.placement_test_score || 0), 0) / scores.length
        : 0;

      // Get user rank (optional)
      let userRank: number | undefined;
      const user = await this.findById(userId);
      if (user?.placement_test_score) {
        const { count: betterUsers } = await this.supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
          .gt('placement_test_score', user.placement_test_score);
        
        userRank = (betterUsers || 0) + 1;
      }

      return {
        totalUsers,
        completedPlacement,
        averageScore: Math.round(averageScore * 100) / 100,
        userRank
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search users by display name or email
   */
  async searchUsers(
    searchTerm: string, 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<User>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      } else {
        query = query.order('created_at', { ascending: false });
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
        data: (data || []) as User[],
        count: totalCount,
        hasMore
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent users
   */
  async getRecentUsers(limit: number = 10): Promise<User[]> {
    try {
      const { data } = await this.findAll({}, {
        orderBy: 'created_at',
        orderDirection: 'desc',
        limit
      });

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate user data before operations
   */
  private validateUserData(userData: Partial<CreateUserData | UpdateUserData>): void {
    if ('email' in userData && userData.email && !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    if (userData.skill_level && !['beginner', 'intermediate', 'advanced'].includes(userData.skill_level)) {
      throw new Error('Invalid skill level');
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
