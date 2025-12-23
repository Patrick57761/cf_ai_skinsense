/**
 * Create a standard JSON response with CORS headers
 */
export function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * Create a success response with standard format
 */
export function successResponse(data: any): Response {
  return jsonResponse({ success: true, ...data });
}

/**
 * Create an error response with standard format
 */
export function errorResponse(message: string, status: number = 500): Response {
  return jsonResponse(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    },
    status
  );
}
