export function evaluateCrowdEnding({ trust, fear, presences } = {}) {
  // Trust and fear use a 0–100 scale; presences counts nearby entities.
  for (const [name, value] of Object.entries({ trust, fear })) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(name + ' must be a finite number.');
    }
    if (value < 0 || value > 100) {
      throw new RangeError(name + ' must be between 0 and 100.');
    }
  }
  if (!Number.isSafeInteger(presences) || presences < 0) {
    throw new RangeError('presences must be a nonnegative safe integer.');
  }

  // High means at least 60. A strict lead wins; ties remain ambiguous.
  const company = presences === 0
    ? 'The empty room carries its promise.'
    : presences === 1
      ? 'One presence remains beside you.'
      : presences + ' presences remain beside you.';

  if (trust >= 60 && trust > fear) {
    return {
      phase: 'guardian',
      title: 'The Crowd Keeps Watch',
      description: 'You turn your back on the doorway, and nothing follows. The crowd closes around the dark to give you room to leave. ' + company,
      visual: 'Warm gold silhouettes face outward, forming a protective circle around an open doorway.'
    };
  }

  if (fear >= 60 && fear > trust) {
    return {
      phase: 'predator',
      title: 'The Crowd Learns Hunger',
      description: 'You run. Every footstep teaches the crowd your rhythm. At the final doorway, it arrives before you. ' + company,
      visual: 'Crimson silhouettes lean inward as their shadows converge across the sealed doorway.'
    };
  }

  return {
    phase: 'witness',
    title: 'The Crowd Remembers',
    description: 'You wait for a sign. The crowd waits with you. When the doorway opens, neither side moves first. ' + company,
    visual: 'Silver silhouettes stand motionless beside a half-open doorway, their reflections facing the viewer.'
  };
}
