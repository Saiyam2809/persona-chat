import { NextRequest, NextResponse } from "next/server";
import { getChatResponseStream, ChatMessage } from "@/lib/ai";
import { searchKnowledgeBase } from "@/lib/rag";
import { Persona } from "@/types/chat";

const VALID_PERSONAS: Persona[] = ["hitesh", "piyush"];

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
  try {
    // Extract IP address from request headers
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "127.0.0.1";

    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests! Please wait a couple of minutes before sending more messages to conserve API tokens." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages;
    const persona: Persona = body.persona;

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

    // 1. Fetch sources from Pinecone filtered by persona for citation mapping
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

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

    // 2. Start the OpenAI chat completion stream
    const completionStream = await getChatResponseStream(messages, persona);

    // 3. Pipe completion chunks into a ReadableStream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completionStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
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

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
