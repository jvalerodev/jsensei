// Content model v2.1 - handles unified content (lessons, exercises, quizzes, etc.)
import { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "../base-model";
import {
  Content,
  CreateContentData,
  UpdateContentData,
  ContentType,
  SkillLevel,
  QueryOptions,
  PaginatedResult
} from "../types";

export class ContentModel extends BaseModel<
  Content,
  CreateContentData,
  UpdateContentData
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "contents");
  }

  /**
   * Create content with validation
   */
  async create(contentData: CreateContentData): Promise<Content> {
    this.validateRequired(contentData, [
      "title",
      "content_type",
      "skill_level",
      "content"
    ]);

    const sanitizedData = this.sanitizeData({
      ...contentData,
      difficulty_adjustment: contentData.difficulty_adjustment || 1.0,
      estimated_duration: contentData.estimated_duration || 15,
      order_index: contentData.order_index || 0,
      target_weak_areas: contentData.target_weak_areas || [],
      target_strong_areas: contentData.target_strong_areas || [],
      is_generated_by_ai: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get content by topic_id
   */
  async getContentByTopicId(
    topicId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Content>> {
    try {
      const { data, error } = await this.supabase.rpc(
        "get_contents_by_topic_id",
        { p_topic_id: topicId }
      );

      if (error) {
        throw this.handleError(error);
      }

      return {
        data: (data || []).map(this.parseContent),
        count: data?.length || 0,
        hasMore: false
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's content
   */
  async getUserContent(
    userId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Content>> {
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
      data: result.data.map(this.parseContent)
    };
  }

  /**
   * Get content by learning path
   */
  async getContentByLearningPath(
    learningPathId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Content>> {
    const result = await this.findAll(
      { learning_path_id: learningPathId },
      {
        ...options,
        orderBy: options.orderBy || "order_index",
        orderDirection: options.orderDirection || "asc"
      }
    );

    return {
      ...result,
      data: result.data.map(this.parseContent)
    };
  }

  /**
   * Get content by type and skill level
   */
  async getContentByTypeAndLevel(
    contentType: ContentType,
    skillLevel: SkillLevel,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Content>> {
    const result = await this.findAll(
      {
        content_type: contentType,
        skill_level: skillLevel,
        is_active: true
      },
      options
    );

    return {
      ...result,
      data: result.data.map(this.parseContent)
    };
  }

  /**
   * Get AI generated content for user
   */
  async getAIGeneratedContent(
    userId: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Content>> {
    const result = await this.findAll(
      {
        user_id: userId,
        is_generated_by_ai: true,
        is_active: true
      },
      {
        ...options,
        orderBy: options.orderBy || "created_at",
        orderDirection: options.orderDirection || "desc"
      }
    );

    return {
      ...result,
      data: result.data.map(this.parseContent)
    };
  }

  /**
   * Generate content from learning path using database function
   */
  async generateContentFromLearningPath(
    learningPathId: string,
    userId?: string
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase.rpc(
        "generate_contents_from_learning_path",
        {
          p_learning_path_id: learningPathId,
          p_user_id: userId || null
        }
      );

      if (error) {
        throw this.handleError(error);
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search content by title or description
   */
  async searchContent(
    searchTerm: string,
    filters: {
      contentType?: ContentType;
      skillLevel?: SkillLevel;
      userId?: string;
    } = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Content>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select("*", { count: "exact" })
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq("is_active", true);

      // Apply filters
      if (filters.contentType) {
        query = query.eq("content_type", filters.contentType);
      }
      if (filters.skillLevel) {
        query = query.eq("skill_level", filters.skillLevel);
      }
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.orderDirection !== "desc"
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw this.handleError(error);
      }

      const totalCount = count || 0;
      const hasMore = options.limit
        ? (options.offset || 0) + (options.limit || 0) < totalCount
        : false;

      return {
        data: (data || []).map(this.parseContent),
        count: totalCount,
        hasMore
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Parse content data
   */
  private parseContent(contentData: any): Content {
    return {
      ...contentData,
      content:
        typeof contentData.content === "string"
          ? JSON.parse(contentData.content)
          : contentData.content,
      target_weak_areas: contentData.target_weak_areas || [],
      target_strong_areas: contentData.target_strong_areas || []
    };
  }

  /**
   * Override findById to parse content
   */
  async findById(id: string): Promise<Content | null> {
    const content = await super.findById(id);
    return content ? this.parseContent(content) : null;
  }

  /**
   * Update content with parsing
   */
  async update(
    id: string,
    updateData: UpdateContentData
  ): Promise<Content | null> {
    const sanitizedData = this.sanitizeData({
      ...updateData,
      content: updateData.content,
      updated_at: new Date().toISOString()
    });

    const updated = await super.update(id, sanitizedData);
    return updated ? this.parseContent(updated) : null;
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<{
    totalContent: number;
    contentByType: Record<ContentType, number>;
    contentBySkillLevel: Record<SkillLevel, number>;
    aiGeneratedCount: number;
  }> {
    try {
      const { data } = await this.supabase
        .from(this.tableName)
        .select("content_type, skill_level, is_generated_by_ai")
        .eq("is_active", true);

      const totalContent = data?.length || 0;

      const contentByType = (data || []).reduce((acc, item) => {
        acc[item.content_type as ContentType] =
          (acc[item.content_type as ContentType] || 0) + 1;
        return acc;
      }, {} as Record<ContentType, number>);

      const contentBySkillLevel = (data || []).reduce((acc, item) => {
        acc[item.skill_level as SkillLevel] =
          (acc[item.skill_level as SkillLevel] || 0) + 1;
        return acc;
      }, {} as Record<SkillLevel, number>);

      const aiGeneratedCount = (data || []).filter(
        (item) => item.is_generated_by_ai
      ).length;

      return {
        totalContent,
        contentByType,
        contentBySkillLevel,
        aiGeneratedCount
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
