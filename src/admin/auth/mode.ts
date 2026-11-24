/**
 * The application is powered by the production Node.js + Express backend (backed by PostgreSQL or SQLite).
 * All admin authentication, API calls, and data operations use the unified Express backend endpoints (/api/...).
 */
export function isLocalAdminMode(): boolean {
  return true
}
