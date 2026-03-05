import { vi } from 'vitest';

/**
 * Mock process.exit and console.error for testing validation errors.
 * Returns accessors for the spies.
 */
export function mockProcessExit() {
  let exitSpy;
  let errorSpy;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  return {
    get exitSpy() { return exitSpy; },
    get errorSpy() { return errorSpy; },
  };
}
