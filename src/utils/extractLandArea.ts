/** Extracts built-up area: the first number followed by m² before the word 'pozemek' */
export function extractBuiltUpArea(text: string): number | null {
  if (!text) return null;

  const normalized = text.replace(/\u00A0/g, " ").trim();
  // Match the first m² that appears *before* the word "pozem"
  const match = normalized.match(/(\d[\d\s.,]*)\s*m²(?=.*pozem)/i);
  if (!match) return null;

  return parseInt(match[1].replace(/[^\d]/g, ""), 10);
}

/** Extracts land area: the number that comes after 'pozemek' or 'pozemkem' */
export function extractLandArea(text: string): number | null {
  if (!text) return null;

  const normalized = text.replace(/\u00A0/g, " ").trim();
  const match = normalized.match(/pozem\w*\s+([\d\s.,]+)\s*m²/i);
  if (!match) return null;

  return parseInt(match[1].replace(/[^\d]/g, ""), 10);
}
