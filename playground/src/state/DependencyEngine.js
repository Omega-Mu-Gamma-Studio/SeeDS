// playground/src/state/DependencyEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// The bouncer. Given a PlaygroundState snapshot, decides which bricks are:
//   AVAILABLE — student can place this brick now
//   LOCKED    — deps not met yet, greyed out
//   PLACED    — already placed (show checkmark)
//
// Called after every brick placement. Pure function — no side effects.
// Read spec Section 05 before implementing.
// ─────────────────────────────────────────────────────────────────────────────

export const BRICK_STATES = {
  AVAILABLE: "available",
  LOCKED:    "locked",
  PLACED:    "placed",
};

/**
 * Evaluate the state of every brick given the current snapshot.
 *
 * @param  {{ placed: string[], bricks: Array }} snapshot
 * @returns {Map<string, string>} brickId → BRICK_STATE value
 */
export function evaluate(snapshot) {
  // TODO:
  // const placedSet = new Set(snapshot.placed);
  // For each brick in snapshot.bricks:
  //   - if placedSet.has(brick.id)  → PLACED
  //   - else if all deps in placedSet → AVAILABLE
  //   - else → LOCKED
  // Return the Map.
}
