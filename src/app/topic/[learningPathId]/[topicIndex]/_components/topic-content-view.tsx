'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookOpen, Code, Play, CheckCircle, Loader2 } from 'lucide-react';
import { useTopicContent } from '@/hooks/use-topic-content';
import { useToast } from '@/hooks/use-toast';
import type { Content } from '@/lib/database/types';

interface TopicContentViewProps {
  learningPathId: string;
  topicId: string;
}

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

export function TopicContentView({ learningPathId, topicId }: TopicContentViewProps) {
  const router = useRouter();
  const { generateTopicContent, isLoading } = useTopicContent();
  const { toast } = useToast();
  const [topicData, setTopicData] = useState<TopicContentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopicContent = async () => {
      try {
        const result = await generateTopicContent(learningPathId, topicId);
        if (result) {
          setTopicData(result);
          if (result.wasGenerated) {
            toast({
              title: "Contenido generado",
              description: `Se ha generado el contenido para "${result.topic.title}"`,
            });
          }
        } else {
          setError("No se pudo cargar el contenido del topic");
        }
      } catch (err) {
        console.error("Error loading topic content:", err);
        setError("Error al cargar el contenido del topic");
      }
    };

    loadTopicContent();
  }, [learningPathId, topicId, generateTopicContent, toast]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-slate-600">Generando contenido del topic...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Cargando contenido...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { topic, learningPath, content } = topicData;
  const lessonContent = content.find(c => c.content_type === 'lesson');
  const exerciseContent = content.find(c => c.content_type === 'exercise');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
          <p className="text-slate-600">{learningPath.title}</p>
        </div>
        <Badge variant="outline">
          Topic ID: {topic.id}
        </Badge>
      </div>

      {/* Topic Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Objetivo del Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 mb-4">{topic.objective}</p>
          <div className="flex flex-wrap gap-2">
            {topic.topics.map((subtopic, index) => (
              <Badge key={index} variant="secondary">
                {subtopic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      {lessonContent && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              {lessonContent.title}
            </CardTitle>
            <CardDescription>
              Duración estimada: {lessonContent.estimated_duration} minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <div 
                className="text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: lessonContent.content?.content?.replace(/\n/g, '<br />') || '' 
                }}
              />
            </div>

            {/* Code Examples */}
            {lessonContent.content?.examples && lessonContent.content.examples.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  Ejemplos de Código
                </h3>
                <div className="space-y-4">
                  {lessonContent.content.examples.map((example: any, index: number) => (
                    <Card key={index} className="bg-slate-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{example.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{example.code}</code>
                        </pre>
                        <p className="text-slate-600 mt-3 text-sm">{example.explanation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      {exerciseContent && exerciseContent.content?.exercises && exerciseContent.content.exercises.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-orange-600" />
              Ejercicios Prácticos
            </CardTitle>
            <CardDescription>
              Pon en práctica lo que has aprendido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exerciseContent.content.exercises.map((exercise: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      Ejercicio {index + 1}
                      <Badge variant="outline" className="text-xs">
                        {exercise.difficulty}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 mb-4">{exercise.question}</p>
                    
                    {exercise.options && (
                      <div className="space-y-2 mb-4">
                        {exercise.options.map((option: string, optIndex: number) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs font-medium">
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span className="text-slate-700">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <details className="mt-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                        Ver respuesta y explicación
                      </summary>
                      <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900 mb-2">
                          Respuesta correcta: {exercise.correctAnswer}
                        </p>
                        <p className="text-blue-800 text-sm">{exercise.explanation}</p>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>
        
        <Button className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Marcar como Completado
        </Button>
      </div>
    </div>
  );
}
