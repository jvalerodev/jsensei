import { TopicContentAIService } from "@/lib/ai";
import { getDatabase } from "@/lib/database/server";
import { randomUUID } from "node:crypto";
import type {
  Content,
  CreateContentData,
  LearningPath
} from "@/lib/database/types";

/**
 * Service for managing topic content generation and retrieval
 */
export class TopicContentService {
  /**
   * Check if content exists for a specific topic in a learning path
   */
  static async hasTopicContent(topicId: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const result = await db.contents.getContentByTopicId(topicId);
      return result.data && result.data.length > 0;
    } catch (error) {
      console.error("Error checking topic content:", error);
      return false;
    }
  }

  /**
   * Get existing content for a topic
   */
  static async getTopicContent(topicId: string): Promise<Content[]> {
    try {
      const db = await getDatabase();
      const result = await db.contents.getContentByTopicId(topicId);
      return result.data || [];
    } catch (error) {
      console.error("Error getting topic content:", error);
      return [];
    }
  }

  /**
   * Generate content for a specific topic in a learning path
   */
  static async generateTopicContent(
    userId: string,
    learningPathId: string,
    topicId: string,
    topic: any,
    userSkillLevel: "beginner" | "intermediate"
  ): Promise<Content[]> {
    try {
      const db = await getDatabase();
      console.log(`🔍 Checking if content exists for topic: ${topicId}`);

      // Check if content already exists
      const hasContent = await TopicContentService.hasTopicContent(topicId);
      if (hasContent) {
        console.log(
          `✅ Content already exists for topic: ${topicId}, returning existing content`
        );
        return await TopicContentService.getTopicContent(topicId);
      }

      console.log(
        `🚀 Starting AI content generation for topic: "${topic.title}" (${topicId})`
      );
      console.log(`👤 User skill level: ${userSkillLevel}`);

      const generatedContents: Content[] = [];

      // Get user's learning path to understand weak/strong areas
      const learningPath = await db.learningPaths.findById(learningPathId);
      const userWeakAreas = learningPath?.weak_areas || [];
      const userStrongAreas = learningPath?.strong_areas || [];

      // Generate lesson content using AI
      const lessonContent = await TopicContentAIService.generateTopicContent(
        topic.title,
        topic.objective,
        topic.topics || [],
        userSkillLevel,
        userWeakAreas,
        userStrongAreas
      );

      // Add unique IDs to exercises for database compatibility
      const exercisesWithIds = (lessonContent.exercises || []).map(
        (exercise) => ({
          ...exercise,
          id: randomUUID()
        })
      );

      // Create lesson content in database
      const lessonData: CreateContentData = {
        user_id: userId,
        learning_path_id: learningPathId,
        topic_id: topicId,
        title: lessonContent.title,
        description: topic.objective,
        content_type: "lesson",
        skill_level: userSkillLevel,
        content: {
          title: lessonContent.title,
          content: lessonContent.content,
          examples: lessonContent.examples || [],
          exercises: exercisesWithIds
        },
        estimated_duration: 20, // Increased for AI-generated content
        order_index: 0,
        is_generated_by_ai: true,
        target_weak_areas: userWeakAreas,
        target_strong_areas: userStrongAreas
      };

      console.log(`💾 Saving lesson content to database...`);
      const createdLesson = await db.contents.create(lessonData);
      generatedContents.push(createdLesson);
      console.log(`✅ Lesson content saved with ID: ${createdLesson.id}`);

      // Generate separate exercise content if the lesson has exercises
      if (exercisesWithIds && exercisesWithIds.length > 0) {
        const exerciseData: CreateContentData = {
          user_id: userId,
          learning_path_id: learningPathId,
          topic_id: topicId,
          title: `Ejercicios: ${topic.title}`,
          description: `Ejercicios prácticos para ${topic.title}`,
          content_type: "exercise",
          skill_level: userSkillLevel,
          content: {
            title: `Ejercicios: ${topic.title}`,
            exercises: exercisesWithIds
          },
          estimated_duration: 15, // Increased for AI-generated exercises
          order_index: 1,
          is_generated_by_ai: true,
          target_weak_areas: userWeakAreas,
          target_strong_areas: userStrongAreas
        };

        console.log(`💾 Saving exercise content to database...`);
        const createdExercise = await db.contents.create(exerciseData);
        generatedContents.push(createdExercise);
        console.log(`✅ Exercise content saved with ID: ${createdExercise.id}`);
      }

      console.log(
        `🎉 Content generation completed for topic: "${topic.title}". Generated ${generatedContents.length} content items.`
      );
      return generatedContents;
    } catch (error) {
      console.error("Error generating topic content:", error);
      throw error;
    }
  }

  /**
   * Get or generate content for a topic
   */
  static async getOrGenerateTopicContent(
    userId: string,
    learningPathId: string,
    topicId: string,
    topic: any,
    userSkillLevel: "beginner" | "intermediate"
  ): Promise<{
    content: Content[];
    wasGenerated: boolean;
  }> {
    try {
      // First, try to get existing content
      const existingContent = await this.getTopicContent(topicId);

      if (existingContent.length > 0) {
        return {
          content: existingContent,
          wasGenerated: false
        };
      }

      // If no content exists, generate it
      const generatedContent = await this.generateTopicContent(
        userId,
        learningPathId,
        topicId,
        topic,
        userSkillLevel
      );

      return {
        content: generatedContent,
        wasGenerated: true
      };
    } catch (error) {
      console.error("Error getting or generating topic content:", error);
      throw error;
    }
  }

  /**
   * Get topic by ID from learning path
   */
  static getTopicById(learningPath: LearningPath, topicId: string): any | null {
    try {
      // Assuming topics is an array and each topic has an id field
      if (Array.isArray(learningPath.topics)) {
        return (
          learningPath.topics.find((topic: any) => topic.id === topicId) || null
        );
      }
      return null;
    } catch (error) {
      console.error("Error getting topic by ID:", error);
      return null;
    }
  }
}
