import { describe, expect, it } from 'vitest';

import { sanitize } from '@/utils/security';

describe('security - sanitize', () => {
  it('should return same string for clean input', () => {
    const input = 'Hello World';
    expect(sanitize(input)).toBe('Hello World');
  });

  it('should sanitize HTML script tags', () => {
    const input = '<script>alert("XSS")</script>';
    const result = sanitize(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('should sanitize inline event handlers', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = sanitize(input);
    expect(result).not.toContain('onerror');
  });

  it('should allow safe HTML tags', () => {
    const input = '<strong>Bold text</strong>';
    const result = sanitize(input);
    expect(result).toContain('strong');
    expect(result).toContain('Bold text');
  });

  it('should return non-string inputs as-is', () => {
    expect(sanitize(123)).toBe(123);
    expect(sanitize(null)).toBe(null);
    expect(sanitize(undefined)).toBe(undefined);
    expect(sanitize(true)).toBe(true);
  });

  it('should handle empty string', () => {
    expect(sanitize('')).toBe('');
  });

  it('should handle string with special characters', () => {
    const input = 'Test & "quotes" and <brackets>';
    const result = sanitize(input);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should sanitize javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitize(input);
    expect(result).not.toContain('javascript:');
  });

  it('should remove iframe tags', () => {
    const input = '<iframe src="evil.com"></iframe>';
    const result = sanitize(input);
    expect(result).not.toContain('<iframe');
  });

  it('should handle object input', () => {
    const obj = { key: 'value' };
    expect(sanitize(obj)).toBe(obj);
  });

  it('should handle array input', () => {
    const arr = [1, 2, 3];
    expect(sanitize(arr)).toBe(arr);
  });
});
