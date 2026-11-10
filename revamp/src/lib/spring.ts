/**
 * Spring physics for natural-feeling animations.
 * x(t) = A * e^(-ζωt) * cos(ωd*t - φ)
 *
 * Default: ζ=0.7, ω=12 (slightly underdamped — one small overshoot then settle)
 */

export interface SpringConfig {
  stiffness: number;  // ω² * mass (default 400)
  damping: number;    // 2ζω * mass (default 28)
  mass: number;       // default 1
  precision: number;  // settle threshold (default 0.01)
}

// Two canonical spring presets for the entire app
export const SPRING_STANDARD: SpringConfig = { stiffness: 500, damping: 30, mass: 1, precision: 0.01 };
export const SPRING_BOUNCE: SpringConfig = { stiffness: 600, damping: 34, mass: 1, precision: 0.01 };

// Legacy aliases — map to unified presets
export const SPRING_DEFAULT: SpringConfig = SPRING_STANDARD;
export const SPRING_SNAPPY: SpringConfig = SPRING_STANDARD;
export const SPRING_GENTLE: SpringConfig = SPRING_STANDARD;
export const SPRING_RUBBER: SpringConfig = SPRING_BOUNCE;

export interface SpringState {
  value: number;
  velocity: number;
  target: number;
  config: SpringConfig;
  settled: boolean;
}

export function createSpring(initial: number, config: Partial<SpringConfig> = {}): SpringState {
  const c = { ...SPRING_DEFAULT, ...config };
  return { value: initial, velocity: 0, target: initial, config: c, settled: true };
}

// Longest single integration step. Semi-implicit Euler at stiffness 500 and
// damping 30 is unstable at the 64 ms frame cap below: each step multiplies the
// error by about -2.4, so a run of slow frames sent the reader card to
// translateX(7e18px) and it never settled, leaving the reader blank and stuck.
// Longer frames are integrated in equal sub-steps; 60 Hz and faster frames take
// one step, exactly as before.
const MAX_STEP = 1 / 60;

/**
 * Advance spring by dt seconds. Returns new state (immutable).
 */
export function stepSpring(s: SpringState, dt: number): SpringState {
  if (s.settled) return s;

  const { stiffness, damping, mass, precision } = s.config;
  const steps = Math.max(1, Math.ceil(dt / MAX_STEP - 1e-9));
  const h = dt / steps;
  let newValue = s.value;
  let newVelocity = s.velocity;
  for (let i = 0; i < steps; i++) {
    const springForce = -stiffness * (newValue - s.target);
    const dampingForce = -damping * newVelocity;
    const acceleration = (springForce + dampingForce) / mass;
    newVelocity += acceleration * h;
    newValue += newVelocity * h;
  }
  const newDisplacement = Math.abs(newValue - s.target);
  const settled = newDisplacement < precision && Math.abs(newVelocity) < precision;

  return {
    ...s,
    value: settled ? s.target : newValue,
    velocity: settled ? 0 : newVelocity,
    settled,
  };
}

/**
 * Animate a spring to a target using rAF. Calls onUpdate each frame.
 * Returns a cancel function.
 */
export function animateSpring(
  spring: SpringState,
  target: number,
  onUpdate: (value: number, velocity: number) => void,
  onComplete?: () => void,
): () => void {
  spring.target = target;
  spring.settled = false;
  let raf = 0;
  let lastTime = performance.now();

  function tick(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 0.064); // cap at ~15fps minimum
    lastTime = now;
    spring = stepSpring(spring, dt);
    onUpdate(spring.value, spring.velocity);
    if (spring.settled) {
      onComplete?.();
    } else {
      raf = requestAnimationFrame(tick);
    }
  }

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
