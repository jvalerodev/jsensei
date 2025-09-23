import { useState, useCallback } from 'react';
import type { Content } from '@/lib/database/types';

interface TopicContentData {
  content: Content[];
  wasGenerated: boolean;
  topic: {
    id: string;
    title: string;
    objective: string;
    topics: string[];
  };
  learningPath: {
    id: string;
    title: string;
    description: string;
  };
}

interface UseTopicContentReturn {
  generateTopicContent: (learningPathId: string, topicId: string) => Promise<TopicContentData | null>;
  checkTopicContent: (learningPathId: string, topicId: string) => Promise<{ hasContent: boolean; content: Content[] } | null>;
  isLoading: boolean;
  error: string | null;
}

export function useTopicContent(): UseTopicContentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTopicContent = useCallback(async (
    learningPathId: string, 
    topicId: string
  ): Promise<TopicContentData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learningPathId,
          topicId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar contenido del topic');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al generar contenido del topic');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error generating topic content:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkTopicContent = useCallback(async (
    learningPathId: string, 
    topicId: string
  ): Promise<{ hasContent: boolean; content: Content[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        learningPathId,
        topicId
      });

      const response = await fetch(`/api/content/generate-topic?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al verificar contenido del topic');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al verificar contenido del topic');
      }

      return {
        hasContent: result.data.hasContent,
        content: result.data.content
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error checking topic content:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateTopicContent,
    checkTopicContent,
    isLoading,
    error
  };
}
