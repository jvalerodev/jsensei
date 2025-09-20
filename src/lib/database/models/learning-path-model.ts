// Learning path model - handles personalized learning paths
import { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "../base-model";
import {
  LearningPath,
  CreateLearningPathData,
  PlacementAnalysis,
  CreatePlacementAnalysisData,
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
      "path_id",
      "title",
      "description",
      "topics",
      "estimated_duration"
    ]);

    const sanitizedData = this.sanitizeData({
      ...pathData,
      created_at: new Date().toISOString()
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

export class PlacementAnalysisModel extends BaseModel<
  PlacementAnalysis,
  CreatePlacementAnalysisData,
  Partial<CreatePlacementAnalysisData>
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "placement_analysis");
  }

  /**
   * Create placement analysis with validation
   */
  async create(
    analysisData: CreatePlacementAnalysisData
  ): Promise<PlacementAnalysis> {
    this.validateRequired(analysisData, [
      "user_id",
      "skill_level",
      "weak_areas",
      "strong_areas",
      "recommended_topics",
      "personalized_advice"
    ]);

    const sanitizedData = this.sanitizeData({
      ...analysisData,
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get user's latest analysis
   */
  async getLatestAnalysis(userId: string): Promise<PlacementAnalysis | null> {
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

      return this.parseAnalysis(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get analyses by skill level
   */
  async getAnalysesBySkillLevel(
    skillLevel: SkillLevel,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<PlacementAnalysis>> {
    const result = await this.findAll({ skill_level: skillLevel }, options);

    return {
      ...result,
      data: result.data.map(this.parseAnalysis)
    };
  }

  /**
   * Parse analysis data
   */
  private parseAnalysis(analysisData: any): PlacementAnalysis {
    return {
      ...analysisData,
      weak_areas:
        typeof analysisData.weak_areas === "string"
          ? JSON.parse(analysisData.weak_areas)
          : analysisData.weak_areas,
      strong_areas:
        typeof analysisData.strong_areas === "string"
          ? JSON.parse(analysisData.strong_areas)
          : analysisData.strong_areas,
      recommendations:
        typeof analysisData.recommendations === "string"
          ? JSON.parse(analysisData.recommendations)
          : analysisData.recommendations,
      analysis_data:
        typeof analysisData.analysis_data === "string"
          ? JSON.parse(analysisData.analysis_data)
          : analysisData.analysis_data
    };
  }

  /**
   * Override findById to parse analysis
   */
  async findById(id: string): Promise<PlacementAnalysis | null> {
    const analysis = await super.findById(id);
    return analysis ? this.parseAnalysis(analysis) : null;
  }
}
