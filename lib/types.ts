export interface Article {
  title: string;
  url: string;
  description: string;
  content: string;
  image?: string;
}

export interface SavedContent {
  text: string;
  image?: string;
  timestamp: number;
  platform: "linkedin" | "twitter";
}

export type ContentLibrary = Record<string, SavedContent[]>;
