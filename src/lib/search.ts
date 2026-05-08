/**
 * Normalizes text for search by:
 * 1. Converting to lowercase
 * 2. Replacing hyphens with spaces
 * 3. Removing non-alphanumeric characters (while keeping Arabic characters)
 * 4. Collapsing multiple spaces into one
 * 5. Trimming
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/[^\w\s\u0600-\u06FF]/g, "") // Remove special characters, keep words and Arabic
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Checks if a target text matches a search query after normalization.
 */
export function isMatch(target: string, query: string): boolean {
  const normalizedTarget = normalizeText(target);
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedQuery) return true;
  
  return normalizedTarget.includes(normalizedQuery);
}
