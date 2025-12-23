/**
 * Parse JSON from AI response that may contain markdown formatting or extra text
 * Extracts the first valid JSON object found in the response string
 */
export function parseJSON(response: string): any | null {
  const start = response.indexOf('{');
  const end = response.lastIndexOf('}');

  if (start < 0 || end < 0) {
    return null;
  }

  try {
    const jsonString = response.substring(start, end + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Convert various response types to string format
 * Handles strings, objects, and other types
 */
export function responseToString(response: any): string {
  if (typeof response === 'string') {
    return response;
  }
  if (response && typeof response === 'object') {
    return JSON.stringify(response);
  }
  return String(response || '');
}
