import { Suspense } from "react";
import {
  TopicContentSkeleton,
  TopicContentView,
  TopicErrorCard
} from "./_components";

type TopicPageProps = {
  learningPathId: string;
  topicId: string;
};

export default async function TopicPage({
  params
}: {
  params: Promise<TopicPageProps>;
}) {
  const { topicId, learningPathId } = await params;

  if (!topicId) {
    return <TopicErrorCard title="Error" message="Topic ID inválido" />;
  }

  return (
    <Suspense fallback={<TopicContentSkeleton />}>
      <TopicContentView learningPathId={learningPathId} topicId={topicId} />
    </Suspense>
  );
}
