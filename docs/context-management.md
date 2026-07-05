# Context Management & Conversation Memory

This document describes how the application maintains long-term conversation relevance while avoiding token bloat and context drift.

## Sliding Window Memory

To keep the system highly scalable, the application implements a sliding window algorithm in `lib/ai.ts`:

1. **Threshold check**: If the total message history is **less than or equal to 20 messages**, we send all messages to OpenAI.
2. **Slicing**: If history grows **past 20 messages**, we partition the conversation:
   * **Active Window**: The last 10 messages are sent as active, fully-intact conversation context.
   * **Historical Window**: All messages preceding the active window are grouped together for compression.

## Automatic Summarization

* The historical window messages are compiled into a plain-text transcript.
* We make a fast background call to `gpt-4o-mini` with a summarization system prompt:
  > "Summarize the following conversation history concisely in a single short paragraph. Focus on the main topics discussed, technical parameters mentioned, and user needs."
* This summary is injected into the system prompt compilation by `PromptBuilder`:

```markdown
## Summary of Earlier Conversation
[Summarized paragraph here...]
```

* This maintains continuity for past references (e.g. "remember the database setup we talked about earlier?") while saving up to 80% on prompt context tokens.
