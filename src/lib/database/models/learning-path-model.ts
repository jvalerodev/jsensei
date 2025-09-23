// Learning path model - handles personalized learning paths
import { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "../base-model";
import {
  LearningPath,
  CreateLearningPathData,
  SkillLevel,
  QueryOptions,
  PaginatedResult
} from "../types";

export class LearningPathModel extends BaseModel<
  LearningPath,
  CreateLearningPathData,
  Partial<CreateLearningPathData>
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "learning_paths");
  }

  /**
   * Create learning path with validation
   */
  async create(pathData: CreateLearningPathData): Promise<LearningPath> {
    this.validateRequired(pathData, [
      "user_id",
      "title",
      "skill_level",
      "topics"
    ]);

    const sanitizedData = this.sanitizeData({
      ...pathData,
      weak_areas: pathData.weak_areas || [],
      strong_areas: pathData.strong_areas || [],
      recommended_topics: pathData.recommended_topics || [],
      estimated_duration: pathData.estimated_duration || 0,
      is_active: true,
      progress_percentage: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's learning paths
   */
  async getUserPaths(
    userId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<LearningPath>> {
    const result = await this.findAll(
      { user_id: userId },
      {
        ...options,
        orderBy: options.orderBy || "created_at",
        orderDirection: options.orderDirection || "desc"
      }
    );

    return {
      ...result,
      data: result.data.map(this.parsePath)
    };
  }

  /**
   * Get user's active learning path
   */
  async getActivePath(userId: string): Promise<LearningPath | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw this.handleError(error);
      }

      return this.parsePath(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get path by path_id
   */
  async findByPathId(pathId: string): Promise<LearningPath | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .eq("path_id", pathId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw this.handleError(error);
      }

      return this.parsePath(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Parse path data
   */
  private parsePath(pathData: any): LearningPath {
    return {
      ...pathData,
      topics:
        typeof pathData.topics === "string"
          ? JSON.parse(pathData.topics)
          : pathData.topics
    };
  }

  /**
   * Override findById to parse topics
   */
  async findById(id: string): Promise<LearningPath | null> {
    const path = await super.findById(id);
    return path ? this.parsePath(path) : null;
  }
}

// PlacementAnalysisModel removed - functionality integrated into learning_paths table
