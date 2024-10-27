export type ContentLibrary = Record<string, string[]>;

export function addToLibrary(
  library: ContentLibrary,
  url: string,
  content: string
): ContentLibrary {
  return {
    ...library,
    [url]: [...(library[url] || []), content],
  };
}
