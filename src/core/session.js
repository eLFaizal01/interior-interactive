/** Engine-independent challenge state. All timestamps use a monotonic clock. */
export class Session {
  constructor({duration, targetIds, previewSeconds = 5, now = 0, freeplay = false, startOn = 'preview-end'}) {
    this.duration = duration;
    this.remaining = duration;
    this.targets = new Set(targetIds);
    this.placed = new Set();
    this.freeplay = freeplay;
    this.untimed = freeplay;
    this.started = false;
    this.startOn = startOn;
    this.phase = freeplay ? 'playing' : 'preview';
    this.previewRemaining = previewSeconds;
    this.previewReturn = 'ready';
    this.lastTime = now;
  }
  tick(now) {
    const delta = Math.max(0, now - this.lastTime) / 1000;
    this.lastTime = now;
    if (this.phase === 'preview') {
      const overshoot = Math.max(0, delta - this.previewRemaining);
      this.previewRemaining = Math.max(0, this.previewRemaining - delta);
      if (this.previewRemaining === 0) {
        this.phase = this.previewReturn;
        if (this.phase === 'ready' && this.startOn === 'preview-end') {
          this.started = true;
          this.phase = 'playing';
        }
        if (this.phase === 'playing' && this.started && !this.untimed) {
          this.remaining = Math.max(0, this.remaining - overshoot);
          if (this.remaining === 0) this.phase = 'timeout';
        }
      }
    } else if (this.phase === 'playing' && this.started && !this.untimed) {
      this.remaining = Math.max(0, this.remaining - delta);
      if (this.remaining === 0) this.phase = 'timeout';
    }
    return this.phase;
  }
  canInteract() { return this.phase === 'ready' || this.phase === 'playing'; }
  beginDrag(now) {
    this.tick(now);
    if (!this.canInteract()) return false;
    this.started = true;
    this.phase = 'playing';
    return true;
  }
  place(targetId, now) {
    this.tick(now);
    if (!this.canInteract() || !this.started || !this.targets.has(targetId) || this.placed.has(targetId)) return false;
    this.placed.add(targetId);
    if (this.placed.size === this.targets.size) this.phase = 'won';
    return true;
  }
  pause(now) {
    this.tick(now);
    if (!['ready','playing','preview'].includes(this.phase)) return false;
    this.resumePhase = this.phase;
    this.phase = 'paused';
    return true;
  }
  resume(now) {
    if (this.phase !== 'paused') return;
    this.lastTime = now;
    this.phase = this.resumePhase;
  }
  preview(now, seconds = 5) {
    this.tick(now);
    if (!this.canInteract()) return false;
    this.previewReturn = this.phase;
    this.previewRemaining = seconds;
    this.phase = 'preview';
    return true;
  }
  continueUntimed(now) {
    if (this.phase !== 'timeout') return;
    this.untimed = true;
    this.phase = 'playing';
    this.lastTime = now;
  }
  stars() {
    if (this.phase !== 'won') return 0;
    return this.untimed ? 1 : this.remaining >= this.duration / 3 ? 3 : 2;
  }
}

export function matchingTarget(targets, placed, furnitureId, position, tolerance) {
  return targets.find(target => target.furnitureId === furnitureId && !placed.has(target.id)
    && Math.hypot(target.transform.position[0]-position.x, target.transform.position[2]-position.z) <= tolerance);
}
