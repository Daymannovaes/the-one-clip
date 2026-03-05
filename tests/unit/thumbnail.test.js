import { describe, it, expect, vi } from 'vitest';
import { parseTitle, getOutputPath } from '../../commands/thumbnail.js';

describe('parseTitle', () => {
  it('should return plain words as spans without highlight', () => {
    const result = parseTitle('Hello World');
    expect(result).toHaveLength(2);
    expect(result[0].props.children).toBe('Hello');
    expect(result[0].props.style).toEqual({});
    expect(result[1].props.children).toBe('World');
  });

  it('should highlight *wrapped* words with gold color', () => {
    const result = parseTitle('Hello *World*');
    expect(result).toHaveLength(2);
    expect(result[0].props.style).toEqual({});
    expect(result[1].props.style).toEqual({ color: '#f0b429' });
    expect(result[1].props.children).toBe('World');
  });

  it('should handle multiple highlighted words', () => {
    const result = parseTitle('*Hello* *World*');
    expect(result).toHaveLength(2);
    expect(result[0].props.style).toEqual({ color: '#f0b429' });
    expect(result[1].props.style).toEqual({ color: '#f0b429' });
  });

  it('should handle multi-word highlights', () => {
    const result = parseTitle('This is *very important* text');
    expect(result).toHaveLength(5);
    // "very" and "important" should be highlighted
    const highlighted = result.filter(w => w.props.style.color === '#f0b429');
    expect(highlighted).toHaveLength(2);
    expect(highlighted[0].props.children).toBe('very');
    expect(highlighted[1].props.children).toBe('important');
  });

  it('should handle title with no highlights', () => {
    const result = parseTitle('Plain Title');
    expect(result).toHaveLength(2);
    result.forEach(w => expect(w.props.style).toEqual({}));
  });

  it('should handle mixed normal and highlighted segments', () => {
    const result = parseTitle('A *B* C *D* E');
    expect(result).toHaveLength(5);
    expect(result[0].props.style).toEqual({});          // A
    expect(result[1].props.style.color).toBe('#f0b429'); // B
    expect(result[2].props.style).toEqual({});           // C
    expect(result[3].props.style.color).toBe('#f0b429'); // D
    expect(result[4].props.style).toEqual({});           // E
  });

  it('should return span elements', () => {
    const result = parseTitle('Test');
    expect(result[0].type).toBe('span');
  });
});

describe('getOutputPath', () => {
  it('should use opts.output when provided and no templateName', () => {
    const result = getOutputPath('input.jpg', { output: '/custom/path.png' });
    expect(result).toBe('/custom/path.png');
  });

  it('should generate timestamped path when no output specified', () => {
    const result = getOutputPath('/dir/input.jpg', {});
    expect(result).toMatch(/^\/dir\/input_\d{4}-\d{2}-\d{2}.*\.png$/);
  });

  it('should include template name in generated path', () => {
    const result = getOutputPath('/dir/input.jpg', {}, 'bold');
    expect(result).toContain('_bold_');
  });

  it('should ignore opts.output when templateName is provided', () => {
    const result = getOutputPath('/dir/input.jpg', { output: '/custom.png' }, 'side');
    expect(result).not.toBe('/custom.png');
    expect(result).toContain('_side_');
  });
});
