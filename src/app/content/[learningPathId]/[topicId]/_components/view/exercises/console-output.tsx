"use client";

import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutionResult } from "@/lib/services/code-execution";

type ConsoleOutputProps = {
  result: ExecutionResult;
};

export function ConsoleOutput({ result }: ConsoleOutputProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-700";
      case "warn":
        return "text-amber-700";
      case "info":
        return "text-blue-700";
      default:
        return "text-slate-800";
    }
  };

  return (
    <Card className="border-slate-300 bg-white">
      <CardHeader className="pb-3 border-b border-slate-200 gap-y-0 py-0">
        <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
          <Terminal className="h-4 w-4" />
          Salida de la consola
          <span className="text-xs text-slate-500 font-normal">
            ({result.executionTime.toFixed(2)}ms)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm max-h-[400px] overflow-y-auto border border-slate-200">
          {result.output.length === 0 && !result.error && (
            <p className="text-slate-500 italic text-base">
              Sin salida en la consola.
            </p>
          )}

          {result.output.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2 last:mb-0">
              {getIcon(item.type)}
              <pre
                className={cn(
                  getTextColor(item.type),
                  "whitespace-pre-wrap break-words flex-1 font-mono"
                )}
                style={{
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: "0.875rem",
                  lineHeight: "1.7",
                  tabSize: 2
                }}
              >
                {item.message}
              </pre>
            </div>
          ))}

          {result.error && (
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-red-200">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-semibold mb-1">Error:</p>
                <pre
                  className="text-red-600 whitespace-pre-wrap break-words"
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: "0.875rem",
                    lineHeight: "1.7",
                    tabSize: 2
                  }}
                >
                  {result.error}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
