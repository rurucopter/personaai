/**
 * Lets a visitor start typing their story/style on the marketing homepage
 * before they're logged in — the choice is stashed here and picked up by
 * the create wizard right after signup/login, instead of being lost.
 */
export const PENDING_CREATION_KEY = "personaai:pending-creation";

export interface PendingCreation {
  story: string;
  personaId: string;
  durationSeconds: 5 | 10;
}

export function readPendingCreation(): PendingCreation | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CREATION_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_CREATION_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed?.story || !parsed?.personaId) return null;
    return parsed;
  } catch {
    return null;
  }
}
