import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

const { transcriptCommand, safelyTranscriptCommand } = await import('../../commands/transcript.js');

describe('transcriptCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should throw when input file is missing', async () => {
    await expect(transcriptCommand(null, { output: 'out.srt' }))
      .rejects.toThrow('required');
  });

  it('should throw when output is missing', async () => {
    await expect(transcriptCommand('input.wav', {}))
      .rejects.toThrow('required');
  });

  it('should use default whisper path when not specified', async () => {
    await transcriptCommand('input.wav', { output: 'out.srt' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('whisper.cpp/main');
  });

  it('should use custom whisper path when specified', async () => {
    await transcriptCommand('input.wav', {
      output: 'out.srt',
      whisperPath: '/custom/whisper',
    });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('/custom/whisper');
  });

  it('should pass -osrt and -of flags', async () => {
    await transcriptCommand('input.wav', { output: 'out.srt' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-osrt');
    expect(cmd).toContain('-of');
  });
});

describe('safelyTranscriptCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should pass WAV files directly without conversion', async () => {
    await safelyTranscriptCommand('input.wav', { output: 'out.srt' });
    // Only one call = whisper (no extract-audio call)
    expect(mockDollar).toHaveBeenCalledTimes(1);
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('whisper');
  });

  it('should auto-convert non-WAV files to WAV first', async () => {
    await safelyTranscriptCommand('input.mkv', { output: 'out.srt' });
    // Two calls: extract-audio then whisper
    expect(mockDollar).toHaveBeenCalledTimes(2);
    const extractCmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(extractCmd).toContain('ffmpeg');
    expect(extractCmd).toContain('-ar');
    expect(extractCmd).toContain('16000');
  });
});
