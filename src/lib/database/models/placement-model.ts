// Placement test model - handles placement questions and responses
import { SupabaseClient } from "@supabase/supabase-js";
import { BaseModel } from "../base-model";
import {
  PlacementTest,
  CreatePlacementTestData,
  DifficultyLevel,
  QueryOptions,
  PaginatedResult
} from "../types";

export class PlacementTestModel extends BaseModel<
  PlacementTest,
  CreatePlacementTestData,
  Partial<CreatePlacementTestData>
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "placement_tests");
  }

  /**
   * Create a placement question with validation
   */
  async create(questionData: CreatePlacementTestData): Promise<PlacementTest> {
    this.validateRequired(questionData, [
      "question",
      "options",
      "correct_answer",
      "difficulty_level",
      "topic"
    ]);

    this.validateQuestionData(questionData);

    const sanitizedData = this.sanitizeData({
      ...questionData,
      points: questionData.points || 1,
      is_active: true,
      created_at: new Date().toISOString()
    });

    return super.create(sanitizedData);
  }

  /**
   * Get questions by difficulty level
   */
  async getQuestionsByDifficulty(
    difficultyLevel: DifficultyLevel,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<PlacementTest>> {
    return this.findAll(
      {
        difficulty_level: difficultyLevel,
        is_active: true
      },
      {
        ...options,
        orderBy: options.orderBy || "created_at",
        orderDirection: options.orderDirection || "asc"
      }
    );
  }

  /**
   * Get questions by topic
   */
  async getQuestionsByTopic(
    topic: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<PlacementTest>> {
    return this.findAll(
      {
        topic,
        is_active: true
      },
      options
    );
  }

  /**
   * Get random questions for placement test
   */
  async getRandomQuestions(
    count: number = 20,
    difficultyLevel?: DifficultyLevel
  ): Promise<PlacementTest[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select("*")
        .eq("is_active", true);

      if (difficultyLevel) {
        query = query.eq("difficulty_level", difficultyLevel);
      }

      // Get random questions using PostgreSQL's TABLESAMPLE or ORDER BY RANDOM()
      const { data, error } = await query
        .order("created_at", { ascending: false }) // Fallback ordering
        .limit(count * 2); // Get more than needed for randomization

      if (error) {
        throw this.handleError(error);
      }

      // Shuffle and return requested count
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      return shuffled
        .slice(0, count)
        .map(this.parseQuestion) as PlacementTest[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk insert questions
   */
  async bulkInsert(
    questions: CreatePlacementTestData[]
  ): Promise<PlacementTest[]> {
    const sanitizedQuestions = questions.map((q) => ({
      ...q,
      points: q.points || 1,
      is_active: true,
      created_at: new Date().toISOString()
    }));

    return super.createMany(sanitizedQuestions);
  }

  /**
   * Parse question data (convert JSON strings back to arrays)
   */
  private parseQuestion = (questionData: any): PlacementTest => {
    return {
      ...questionData,
      options:
        typeof questionData.options === "string"
          ? JSON.parse(questionData.options)
          : questionData.options
    };
  };

  /**
   * Validate question data
   */
  private validateQuestionData(
    questionData: Partial<CreatePlacementTestData>
  ): void {
    if (
      questionData.options &&
      (!Array.isArray(questionData.options) || questionData.options.length < 2)
    ) {
      throw new Error("Question must have at least 2 options");
    }

    if (
      questionData.correct_answer &&
      questionData.options &&
      !questionData.options.includes(questionData.correct_answer)
    ) {
      throw new Error("Correct answer must be one of the provided options");
    }

    if (
      questionData.difficulty_level &&
      !["beginner", "intermediate"].includes(questionData.difficulty_level)
    ) {
      throw new Error("Invalid difficulty level");
    }

    if (questionData.points && questionData.points <= 0) {
      throw new Error("Points must be greater than 0");
    }
  }

  /**
   * Override findById to parse question
   */
  async findById(id: string): Promise<PlacementTest | null> {
    const question = await super.findById(id);
    return question ? this.parseQuestion(question) : null;
  }

  /**
   * Find multiple questions by IDs
   */
  async findByIds(ids: string[]): Promise<PlacementTest[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .in("id", ids);

      if (error) {
        throw this.handleError(error);
      }

      return (data || []).map(this.parseQuestion);
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
