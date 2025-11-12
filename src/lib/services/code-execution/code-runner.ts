/**
 * Service for safely executing JavaScript code
 * Captures console output and handles errors
 */

export type ConsoleOutput = {
  type: "log" | "error" | "warn" | "info";
  message: string;
  timestamp: number;
};

export type ExecutionResult = {
  success: boolean;
  output: ConsoleOutput[];
  error?: string;
  executionTime: number;
};

/**
 * Safely executes JavaScript code and captures console output
 * @param code - The JavaScript code to execute
 * @param timeout - Maximum execution time in milliseconds (default: 5000)
 * @returns ExecutionResult with output and any errors
 */
export async function executeCode(
  code: string,
  timeout: number = 5000
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const output: ConsoleOutput[] = [];

  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };

  // Override console methods to capture output
  const captureConsole = (type: ConsoleOutput["type"]) => {
    return (...args: unknown[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");

      output.push({
        type,
        message,
        timestamp: Date.now()
      });
    };
  };

  // Replace console methods
  console.log = captureConsole("log");
  console.error = captureConsole("error");
  console.warn = captureConsole("warn");
  console.info = captureConsole("info");

  try {
    // Execute code with timeout
    await executeWithTimeout(code, timeout);

    const executionTime = performance.now() - startTime;

    return {
      success: true,
      output,
      executionTime
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;

    return {
      success: false,
      output,
      error: error instanceof Error ? error.message : String(error),
      executionTime
    };
  } finally {
    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }
}

/**
 * Executes code with a timeout
 */
async function executeWithTimeout(
  code: string,
  timeout: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Execution timeout: Code took longer than ${timeout}ms to execute`
        )
      );
    }, timeout);

    try {
      // Create a function from the code and execute it
      // Using indirect eval for better security
      const AsyncFunction = Object.getPrototypeOf(
        async function () {}
      ).constructor;
      const func = new AsyncFunction(code);

      // Execute and wait for completion
      Promise.resolve(func())
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Validates if code is safe to execute
 * Basic validation to prevent obviously dangerous code
 */
export function validateCode(code: string): {
  isValid: boolean;
  reason?: string;
} {
  // List of dangerous patterns
  const dangerousPatterns = [
    /require\s*\(/,
    /import\s+/,
    /eval\s*\(/,
    /Function\s*\(/,
    /\bprocess\b/,
    /\b__dirname\b/,
    /\b__filename\b/,
    /\bwindow\b/,
    /\bdocument\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /\bsetInterval\b/
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        isValid: false,
        reason:
          "El código contiene operaciones no permitidas para ejecución segura"
      };
    }
  }

  return { isValid: true };
}
