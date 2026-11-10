import { describe, it, expect } from 'vitest';
import { createSpring, stepSpring, SPRING_STANDARD, SPRING_BOUNCE, type SpringConfig } from '../spring';

// The reader's card exit spring: stiffness 500, damping 30, settle within 5 px.
const EXIT: SpringConfig = { stiffness: 500, damping: 30, mass: 1, precision: 5 };

function run(config: SpringConfig, from: number, to: number, dt: number, maxFrames = 400) {
  let s = { ...createSpring(from, config), target: to, settled: false };
  let peak = Math.abs(from);
  let frames = 0;
  while (!s.settled && frames < maxFrames) {
    s = stepSpring(s, dt);
    peak = Math.max(peak, Math.abs(s.value));
    frames++;
  }
  return { s, peak, frames };
}

describe('stepSpring on slow frames', () => {
  // animateSpring caps a frame at 64 ms. Slow or throttled devices hit that cap.
  for (const [name, config] of [['reader exit', EXIT], ['standard', SPRING_STANDARD], ['bounce', SPRING_BOUNCE]] as const) {
    it(`${name} spring settles at its target with 64 ms frames`, () => {
      const { s, peak } = run(config, 0, -468, 0.064);
      expect(s.settled).toBe(true);
      expect(s.value).toBe(-468);
      expect(peak).toBeLessThan(468 * 1.5);
    });
  }

  it('keeps 60 Hz frames identical to a single semi-implicit Euler step', () => {
    const dt = 1 / 60;
    const s = { ...createSpring(100, SPRING_STANDARD), target: 0, settled: false };
    const velocity = (-SPRING_STANDARD.stiffness * 100) * dt;
    const next = stepSpring(s, dt);
    expect(next.velocity).toBe(velocity);
    expect(next.value).toBe(100 + velocity * dt);
  });
});
