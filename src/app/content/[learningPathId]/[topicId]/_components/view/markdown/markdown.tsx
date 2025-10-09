import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Componentes para código inline en respuestas cortas
export const markdownComponents = {
  code: ({ children, ...props }: any) => (
    <code
      className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-[monospace]"
      {...props}
    >
      {children}
    </code>
  ),
  p: ({ children }: any) => <span className="inline">{children}</span>,
  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-800">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic">{children}</em>
};

// Componentes para preguntas que pueden tener bloques de código
export const questionMarkdownComponents = {
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "javascript";

    // Detectar si es código inline: no tiene className con language-
    const isInline = !className || !className.startsWith("language-");

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
    return <div className="my-4 rounded-lg overflow-hidden">{children}</div>;
  },
  p: ({ children }: any) => (
    <p className="mb-4 leading-relaxed text-slate-700">{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-slate-700">{children}</em>
  )
};

export const blockMarkdownComponents = {
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "javascript";

    // Detectar si es código inline: no tiene className con language-
    const isInline = !className || !className.startsWith("language-");

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
    return <div className="my-4 rounded-lg overflow-hidden">{children}</div>;
  },
  p: ({ children }: any) => (
    <p className="mb-4 leading-relaxed text-slate-700">{children}</p>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold mb-4 mt-6 text-slate-900">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold mb-3 mt-5 text-slate-900">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-medium mb-2 mt-4 text-slate-800">
      {children}
    </h3>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-4 space-y-2 pl-2">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 pl-2">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="text-slate-700 leading-relaxed">{children}</li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-slate-700">{children}</em>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic">
      {children}
    </blockquote>
  ),
  a: ({ children, href }: any) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
};
