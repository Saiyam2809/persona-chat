import { openai } from "./openai";

/**
 * Generate embedding for a single text chunk using text-embedding-3-small.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.replace(/\n/g, " "),
    dimensions: 512,
  });
  return response.data[0].embedding;
}

/**
 * Generate embeddings for a batch of text chunks in a single request.
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts.map((t) => t.replace(/\n/g, " ")),
    dimensions: 512,
  });
  return response.data.map((d) => d.embedding);
}
