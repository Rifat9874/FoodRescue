// Error with an HTTP status code that is safe to show to the user.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wraps every route handler: any thrown error becomes a safe JSON response.
export function handle(fn) {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      if (error?.code === 11000) {
        return Response.json({ error: "That value is already in use." }, { status: 409 });
      }
      if (error?.name === "ValidationError" || error?.name === "CastError") {
        return Response.json({ error: "Invalid input." }, { status: 400 });
      }
      console.error(error); // full details only in the server log
      return Response.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}

export async function readBody(request) {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch {
    // fall through
  }
  throw new ApiError(400, "Request body must be valid JSON.");
}
