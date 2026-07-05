export type Persona = "hitesh" | "piyush";

export interface MessageSource {
  title: string;
  source: string;
  url: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
}

export interface PersonaInfo {
  id: Persona;
  name: string;
  description: string;
  avatar: string;
}
