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
import { markdownComponents } from "./markdown";

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
        <div className="prose prose-slate max-w-none text-slate-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "javascript";

                // Detectar si es código inline: no tiene className con language-
                const isInline =
                  !className || !className.startsWith("language-");

                // Código inline (backticks simples)
                if (isInline) {
                  return (
                    <code
                      className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-[monospace]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                // Bloques de código (triple backticks con lenguaje)
                return (
                  <SyntaxHighlighter
                    style={oneLight}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "#fafafa",
                      border: "1px solid #e2e8f0",
                      padding: "1rem"
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                );
              },
              pre: ({ children }: any) => {
                // Renderizar el pre como un div para evitar problemas de anidación
                return (
                  <div className="my-4 rounded-lg overflow-hidden">
                    {children}
                  </div>
                );
              },
              p: ({ children }: any) => {
                // Párrafos siempre como <p> - el código inline es seguro dentro de <p>
                return (
                  <p className="mb-4 leading-relaxed text-slate-700">
                    {children}
                  </p>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4 mt-6 text-slate-900">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mb-3 mt-5 text-slate-900">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium mb-2 mt-4 text-slate-800">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2 pl-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2 pl-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-slate-700 leading-relaxed">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-900">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-slate-700">{children}</em>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              )
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
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        backgroundColor: "#fafafa",
                        border: "1px solid #e2e8f0",
                        padding: "1rem"
                      }}
                    >
                      {example.code}
                    </SyntaxHighlighter>
                    <div className="text-slate-600 mt-3 text-sm leading-relaxed">
                      <ReactMarkdown components={markdownComponents}>
                        {example.explanation}
                      </ReactMarkdown>
                    </div>
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
