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

export const blockMarkdownComponents = {
  ...markdownComponents,
  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>
};
