/**
 * Parse and validate JSON from request body
 * Throws error if body is not valid JSON
 */
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Validate that required fields exist in request body
 * Throws error with specific missing fields if validation fails
 */
export function requireFields(body: any, fields: string[]): void {
  const missing = fields.filter(field => !body[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
