/**
 * Simple mapping for database event IDs to contract event IDs
 * In a production system, this would be stored in the database
 */

interface EventMapping {
  databaseEventId: string;
  contractEventId: number;
  createdAt: Date;
}

// In-memory storage for event mappings (replace with database storage in production)
const eventMappings = new Map<string, number>();

/**
 * Clear all event mappings (for debugging)
 */
export function clearEventMappings(): void {
  eventMappings.clear();
  console.log('🗑️ Cleared all event mappings');
}

/**
 * Store the mapping between database event ID and contract event ID
 */
export function storeEventMapping(databaseEventId: string, contractEventId: number): void {
  eventMappings.set(databaseEventId, contractEventId);
  console.log(`Stored event mapping: DB ${databaseEventId} -> Contract ${contractEventId}`);
}

/**
 * Get the contract event ID for a database event ID
 */
export function getContractEventId(databaseEventId: string): number | null {
  return eventMappings.get(databaseEventId) || null;
}

/**
 * Check if an event mapping exists
 */
export function hasEventMapping(databaseEventId: string): boolean {
  return eventMappings.has(databaseEventId);
}

/**
 * Get all event mappings (for debugging)
 */
export function getAllEventMappings(): Array<{ databaseEventId: string; contractEventId: number }> {
  return Array.from(eventMappings.entries()).map(([databaseEventId, contractEventId]) => ({
    databaseEventId,
    contractEventId
  }));
}
