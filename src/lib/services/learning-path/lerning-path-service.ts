import { getDatabase } from "@/lib/database/server";
import {
  LearningPath,
  CreateLearningPathData,
  QueryOptions,
  PaginatedResult
} from "@/lib/database/types";

/**
 * LearningPathService - CRUD operations for learning_paths table
 * Provides static methods for managing learning paths using the database model
 */
export class LearningPathService {
  /**
   * Create a new learning path
   */
  static async create(pathData: CreateLearningPathData): Promise<LearningPath> {
    const db = await getDatabase();
    return await db.learningPaths.create(pathData);
  }

  /**
   * Find learning path by ID
   */
  static async findById(id: string): Promise<LearningPath | null> {
    const db = await getDatabase();
    return await db.learningPaths.findById(id);
  }

  /**
   * Get all learning paths for a user
   */
  static async findByUserId(
    userId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<LearningPath>> {
    const db = await getDatabase();
    return await db.learningPaths.getUserPaths(userId, options);
  }

  /**
   * Get user's active learning path (most recent)
   */
  static async getActivePath(userId: string): Promise<LearningPath | null> {
    const db = await getDatabase();
    return await db.learningPaths.getActivePath(userId);
  }

  /**
   * Update a learning path
   */
  static async update(
    id: string,
    updateData: Partial<CreateLearningPathData>
  ): Promise<LearningPath | null> {
    const db = await getDatabase();
    return await db.learningPaths.update(id, updateData);
  }

  /**
   * Delete a learning path
   */
  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.learningPaths.delete(id);
  }

  /**
   * Get all learning paths (with pagination)
   */
  static async findAll(
    options: QueryOptions = {}
  ): Promise<PaginatedResult<LearningPath>> {
    const db = await getDatabase();
    return await db.learningPaths.findAll({}, options);
  }

  /**
   * Update learning path progress
   */
  static async updateProgress(
    id: string,
    progressPercentage: number
  ): Promise<LearningPath | null> {
    return await this.update(id, {
      progress_percentage: progressPercentage
    } as any);
  }
}
