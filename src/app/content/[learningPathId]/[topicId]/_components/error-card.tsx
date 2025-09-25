import { Card, CardContent } from "@/components/ui/card";

interface TopicErrorCardProps {
  title?: string;
  message: string;
}

export function TopicErrorCard({
  title = "Error",
  message
}: TopicErrorCardProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="p-6 text-center space-y-2">
          <h1 className="text-2xl font-bold text-red-600">{title}</h1>
          <p className="text-slate-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
