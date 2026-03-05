import { vi } from 'vitest';

/**
 * Create a mock $`` tagged template result that looks like a zx ProcessOutput.
 */
export function createMockProcess(stdout = '', stderr = '') {
  return {
    stdout,
    stderr,
    exitCode: 0,
    toString() { return stdout; },
  };
}

/**
 * Create a ProcessPromise-like object that supports .nothrow() chaining
 * before await, mimicking zx's behavior: await $`...`.nothrow()
 */
export function createMockProcessPromise(stdout = '', stderr = '') {
  const output = createMockProcess(stdout, stderr);
  const promise = Promise.resolve(output);

  // Add .nothrow() that returns a thenable resolving to the output
  promise.nothrow = () => Promise.resolve(output);

  return promise;
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
