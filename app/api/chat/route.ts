import { NextRequest, NextResponse } from "next/server";
import { getChatResponseStream, ChatMessage } from "@/lib/ai";
import { searchKnowledgeBase } from "@/lib/rag";
import { Persona } from "@/types/chat";

const VALID_PERSONAS: Persona[] = ["hitesh", "piyush"];

export async function POST(req: NextRequest) {
  try {
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
