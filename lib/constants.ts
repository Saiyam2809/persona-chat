import { PersonaInfo } from "@/types/chat";

export const PERSONAS: PersonaInfo[] = [
  {
    id: "hitesh",
    name: "Hitesh Choudhary",
    description: "Friendly mentor • Practical teaching",
    avatar: "/personas/hitesh.png",
  },
  {
    id: "piyush",
    name: "Piyush Garg",
    description: "Backend expert • System design",
    avatar: "/personas/piyush.png",
  },
];

export const EXAMPLE_PROMPTS: Record<string, string[]> = {
  hitesh: [
    "How should I learn React?",
    "Give me an AI roadmap.",
    "Should I learn DevOps?",
  ],
  piyush: [
    "Explain microservices.",
    "When should I use Redis?",
    "How should I structure a backend project?",
  ],
};
