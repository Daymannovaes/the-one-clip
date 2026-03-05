import { vi } from 'vitest';

/**
 * Create a mock $`` tagged template result that looks like a zx ProcessOutput.
 */
export function createMockProcess(stdout = '', stderr = '') {
  const proc = {
    stdout,
    stderr,
    exitCode: 0,
    toString() { return stdout; },
    nothrow() { return proc; },
  };
  return proc;
}

/**
 * Flatten a tagged template call's arguments into a single string.
 * zx's $`...` calls the mock with (pieces, ...args) template literal syntax.
 * This recreates the original command string.
 */
export function flattenTemplateCall(callArgs) {
  const [pieces, ...interpolations] = callArgs;
  let result = '';
  for (let i = 0; i < pieces.length; i++) {
    result += pieces[i];
    if (i < interpolations.length) {
      const val = interpolations[i];
      if (Array.isArray(val)) {
        result += val.join(' ');
      } else {
        result += String(val);
      }
    }
  }
  return result;
}

/**
 * Setup a vi.mock for 'zx' that returns a mock $ function.
 * Returns an accessor for the mock.
 */
export function setupMockZx() {
  let mockDollar;

  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
  });

  // The caller must call vi.mock('zx', ...) themselves since vi.mock is hoisted.
  // This helper just provides the mock function reference.
  return {
    get $() { return mockDollar; },
    set $(fn) { mockDollar = fn; },
    getMockDollar: () => mockDollar,
  };
}
