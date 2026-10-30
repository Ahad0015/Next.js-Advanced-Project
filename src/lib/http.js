export function errorResponse(status, code, message, extra = {}) {
  return Response.json({ error: { code, message }, ...extra }, { status });
}