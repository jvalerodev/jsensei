import { Suspense } from 'react';
import { TopicContentView } from './_components/topic-content-view';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TopicPageProps {
  params: {
    learningPathId: string;
    topicIndex: string; // This will actually be topicId, but keeping the route structure
  };
}

function TopicContentSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TopicPage({ params }: TopicPageProps) {
  const topicId = params.topicIndex; // Using topicIndex param as topicId
  
  if (!topicId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-slate-600">Topic ID inválido</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<TopicContentSkeleton />}>
      <TopicContentView 
        learningPathId={params.learningPathId}
        topicId={topicId}
      />
    </Suspense>
  );
}
