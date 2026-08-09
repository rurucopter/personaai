/**
 * Parses a JSON request body, returning null instead of throwing on a
 * malformed/empty body — so routes can answer 400 cleanly rather than
 * surfacing an unhandled 500.
 */
export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
