import fs from "fs";
import path from "path";

export interface LogEntry {
  timestamp: string;
  ip: string;
  query: string;
  persona: string;
  type: "normal" | "greeting" | "idle" | "rate_limited" | "error";
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  error?: string;
}

/**
 * Appends a JSON structured audit log entry to logs/chat-audit.jsonl.
 * Also prints a clean console statement for live server monitoring.
 */
export function logUsage(entry: Omit<LogEntry, "timestamp">) {
  try {
    const logDir = path.join(process.cwd(), "logs");
    
    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, "chat-audit.jsonl");
    const fullEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // Append to file
    fs.appendFileSync(logFile, JSON.stringify(fullEntry) + "\n", "utf-8");

    // Print to server console
    const tokenInfo = entry.totalTokens 
      ? ` | Tokens: ${entry.totalTokens} (Prompt: ${entry.promptTokens}, Completion: ${entry.completionTokens})`
      : "";
    const errorInfo = entry.error ? ` | Error: ${entry.error}` : "";

    console.log(
      `[AUDIT] ${fullEntry.timestamp} | Type: ${entry.type.toUpperCase()} | IP: ${entry.ip} | Persona: ${entry.persona} | Query: "${entry.query.slice(0, 40)}..."${tokenInfo}${errorInfo}`
    );
  } catch (err) {
    console.error("[Logger] Failed to write usage log:", err);
  }
}
