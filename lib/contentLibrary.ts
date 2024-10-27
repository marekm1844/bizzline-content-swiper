import { ContentLibrary, SavedContent } from "./types";

export type { ContentLibrary, SavedContent } from "./types";

export function addToLibrary(
  library: ContentLibrary,
  url: string,
  content: string,
  platform: "linkedin" | "twitter",
  image?: string
): ContentLibrary {
  const newContent: SavedContent = {
    text: content,
    image: image,
    timestamp: Date.now(),
    platform: platform,
  };

  return {
    ...library,
    [url]: [...(library[url] || []), newContent],
  };
}
