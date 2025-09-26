import { Code } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { Content } from "@/lib/database";

type LessonContentProps = {
  lesson: Content;
};

export function LessonContent({ lesson }: LessonContentProps) {
  const { content, examples } = lesson.content;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-green-600" />
          {lesson.title}
        </CardTitle>
        <CardDescription>
          Duración estimada: {lesson.estimated_duration} minutos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "javascript";

                return !inline ? (
                  <SyntaxHighlighter
                    style={oneLight}
                    language={language}
                    PreTag="span"
                    className="rounded-lg my-4 border block"
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "#fafafa",
                      border: "1px solid #e2e8f0",
                      display: "block"
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded text-sm">
                    {children}
                  </code>
                );
              },
              pre: ({ children, node }: any) => {
                // Si el pre contiene un SyntaxHighlighter, lo renderizamos directamente
                // Si no, lo renderizamos como un bloque de código normal
                if (
                  node?.children?.length === 1 &&
                  node.children[0]?.tagName === "code"
                ) {
                  return <div className="my-4">{children}</div>;
                }
                return (
                  <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto my-4">
                    {children}
                  </pre>
                );
              },
              p: ({ children, node }: any) => {
                // Verificamos si el párrafo contiene elementos que no deberían estar dentro de p
                const hasBlockElements = node?.children?.some((child: any) => {
                  if (child.tagName === "code" && !child.properties?.inline) {
                    return true; // Es un bloque de código
                  }
                  if (child.tagName === "pre") {
                    return true; // Es un pre
                  }
                  return false;
                });

                if (hasBlockElements) {
                  // Si contiene elementos de bloque, renderizamos como div
                  return <div className="mb-4 leading-relaxed">{children}</div>;
                }

                return <p className="mb-4 leading-relaxed">{children}</p>;
              },
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-slate-700">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Code Examples */}
        {examples && examples.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              Ejemplos de Código
            </h3>
            <div className="space-y-4">
              {examples.map((example, index) => (
                <Card key={index} className="bg-slate-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{example.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SyntaxHighlighter
                      style={oneLight}
                      language="javascript"
                      PreTag="span"
                      className="rounded-lg border block"
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        backgroundColor: "#fafafa",
                        border: "1px solid #e2e8f0",
                        display: "block"
                      }}
                    >
                      {example.code}
                    </SyntaxHighlighter>
                    <p className="text-slate-600 mt-3 text-sm">
                      {example.explanation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
