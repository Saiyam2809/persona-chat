import { NextRequest, NextResponse } from "next/server";
import { getChatResponseStream, ChatMessage } from "@/lib/ai";
import { searchKnowledgeBase } from "@/lib/rag";
import { Persona } from "@/types/chat";
import { logUsage } from "@/lib/logger";

const VALID_PERSONAS: Persona[] = ["hitesh", "piyush"];

// ─── Zero-Token Local Classifier Patterns ─────────────────────────────────────
const GREETING_PATTERNS = [
  /^(hi|hello|hey|yo|hola)$/i,
  /\b(wassup|whats\s*up|hey\s*buddy)\b/i
];

const IDLE_PATTERNS = [
  /\b(time\s*pass|timepass|gup\s*shup)\b/i,
  /\b(kaise\s*ho|kese\s*ho|kase\s*ho|kya\s*hal|kya\s*haal)\b/i,
  /\b(how\s*are\s*you|fine|sab\s*badhiya|chitchat|chit\s*chat)\b/i
];

function classifyMessage(text: string): "greeting" | "idle" | "normal" {
  const clean = text.trim();
  if (GREETING_PATTERNS.some((p) => p.test(clean))) {
    return "greeting";
  }
  if (IDLE_PATTERNS.some((p) => p.test(clean))) {
    return "idle";
  }
  return "normal";
}

const STATIC_RESPONSES = {
  hitesh: {
    greeting: "Hanji! Main ready hoon. Web development, JavaScript, React, ya tech roadmaps ke baare mein poocho. Code toh likhna padega! 😉",
    idle: "Dekho buddy, time pass ke liye toh bohot saari jagah hai, par yahan hum sirf coding seekhne ke liye hain! Agar JavaScript, React, ya DevOps seekhna hai toh poocho."
  },
  piyush: {
    greeting: "Hello! I'm here to help with backend engineering, cloud infrastructure, databases, and system design. Let me know what you are building.",
    idle: "Let's focus on engineering. I only discuss software architecture, system design, and database trade-offs. Let me know if you have a technical query."
  }
};

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();
const LIMIT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes window
const MAX_REQUESTS = 10; // Max 10 requests per 2 minutes per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prevent memory growth leak by pruning expired buckets
  if (rateLimitMap.size > 1000) {
    for (const [key, bucket] of rateLimitMap.entries()) {
      if (now > bucket.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  const bucket = rateLimitMap.get(ip);

  if (!bucket) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
    return false;
  }

  if (now > bucket.resetTime) {
    bucket.count = 1;
    bucket.resetTime = now + LIMIT_WINDOW_MS;
    return false;
  }

  bucket.count++;
  return bucket.count > MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "127.0.0.1";
  let lastUserMessage = "";
  let persona: Persona = "hitesh";

  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    persona = body.persona;
    lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // 1. Rate limiting check with audit log
    if (checkRateLimit(ip)) {
      logUsage({
        ip,
        query: lastUserMessage,
        persona,
        type: "rate_limited"
      });
      return NextResponse.json(
        { error: "Too many requests! Please wait a couple of minutes before sending more messages to conserve API tokens." },
        { status: 429 }
      );
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required and must not be empty." },
        { status: 400 }
      );
    }

    // Validate persona
    if (!persona || !VALID_PERSONAS.includes(persona)) {
      return NextResponse.json(
        { error: `persona must be one of: ${VALID_PERSONAS.join(", ")}.` },
        { status: 400 }
      );
    }

    // 2. Run local zero-token classifier to block idle/general messages
    const classification = classifyMessage(lastUserMessage);

    if (classification !== "normal") {
      const staticReply = STATIC_RESPONSES[persona][classification];
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(staticReply));
          controller.close();
        }
      });

      const headers = new Headers({
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Log bypassed interaction
      logUsage({
        ip,
        query: lastUserMessage,
        persona,
        type: classification,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      });

      return new Response(stream, { headers });
    }

    // 3. Fetch sources from Pinecone filtered by persona for citation mapping
    let sourceCitations: Array<{ title: string; source: string; url: string }> = [];

    // Only query if Pinecone is configured
    if (process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== "your_pinecone_api_key_here") {
      try {
        const results = await searchKnowledgeBase(lastUserMessage, persona, 5);
        sourceCitations = results.map((r) => ({
          title: r.metadata.title,
          source: r.metadata.source,
          url: r.metadata.url,
        }));
      } catch (err) {
        console.error("[/api/chat] Pinecone search error:", (err as Error).message);
      }
    }

    // 4. Start the OpenAI chat completion stream
    const completionStream = await getChatResponseStream(messages, persona);

    // 5. Pipe completion chunks into a ReadableStream response and track token metrics
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let finalUsage: any = null;
          for await (const chunk of completionStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
            // Capture usage metrics chunk
            if (chunk.usage) {
              finalUsage = chunk.usage;
            }
          }

          if (finalUsage) {
            logUsage({
              ip,
              query: lastUserMessage,
              persona,
              type: "normal",
              promptTokens: finalUsage.prompt_tokens,
              completionTokens: finalUsage.completion_tokens,
              totalTokens: finalUsage.total_tokens
            });
          }
        } catch (err) {
          console.error("[/api/chat stream] Pipe error:", err);
        } finally {
          controller.close();
        }
      },
    });

    const headers = new Headers({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    if (sourceCitations.length > 0) {
      headers.set("x-sources", JSON.stringify(sourceCitations));
    }

    return new Response(stream, { headers });
  } catch (error) {
    console.error("[/api/chat] error:", error);

    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    logUsage({
      ip,
      query: lastUserMessage || "unknown",
      persona: persona || "unknown",
      type: "error",
      error: message
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
