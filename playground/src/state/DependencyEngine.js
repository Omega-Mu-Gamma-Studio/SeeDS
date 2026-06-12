// playground/src/state/DependencyEngine.js

export const BRICK_STATES = {
  AVAILABLE: "available",
  LOCKED:    "locked",
  PLACED:    "placed",
};

export function evaluate(snapshot) {
  const { placed, bricks } = snapshot;
  const placedSet = new Set(placed);
  const result    = new Map();

  for (const brick of bricks) {
    if (placedSet.has(brick.id)) {
      result.set(brick.id, BRICK_STATES.PLACED);
      continue;
    }
    const depsOk = brick.depends_on.every(dep => placedSet.has(dep));
    result.set(brick.id, depsOk ? BRICK_STATES.AVAILABLE : BRICK_STATES.LOCKED);
  }

  return result;
}
