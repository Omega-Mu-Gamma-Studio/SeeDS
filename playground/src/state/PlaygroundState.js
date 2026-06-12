// playground/src/state/PlaygroundState.js

class PlaygroundState {
  constructor(dsType, brickDefs) {
    this.dsType    = dsType;
    this.brickDefs = brickDefs;
    this.placed    = [];
    this.errors    = new Set();
  }

  placeBrick(brickId) {
    const brick = this.brickDefs.find(b => b.id === brickId);
    if (!brick) return this.snapshot();

    // Check deps — still place it even if wrong order, but flag the error
    const depsOk = brick.depends_on.every(dep => this.placed.includes(dep));
    if (!depsOk && brick.error_if_skipped) {
      this.errors.add(brick.error_if_skipped);
    }

    this.placed.push(brickId);
    return this.snapshot();
  }

  snapshot() {
    return {
      dsType:  this.dsType,
      placed:  [...this.placed],
      errors:  [...this.errors],
      bricks:  this.brickDefs,
    };
  }

  reset() {
    this.placed = [];
    this.errors = new Set();
  }
}

export default PlaygroundState;
