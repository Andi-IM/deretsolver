/* eslint-disable no-console */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import logger from '@/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset logger level to default
    logger.setLevel('INFO');
  });

  it('should log debug messages when level is DEBUG', () => {
    logger.setLevel('DEBUG');
    logger.debug('Test debug message');
    expect(console.debug).toHaveBeenCalled();
  });

  it('should not log debug messages when level is INFO', () => {
    logger.setLevel('INFO');
    logger.debug('Test debug message');
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should log info messages when level is INFO or lower', () => {
    logger.setLevel('INFO');
    logger.info('Test info message');
    expect(console.info).toHaveBeenCalled();
  });

  it('should log warn messages', () => {
    logger.setLevel('INFO');
    logger.warn('Test warn message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.setLevel('INFO');
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalled();
  });

  it('should log info messages with metadata', () => {
    logger.setLevel('INFO');
    logger.info('Test message', { key: 'value' });
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Test message'));
  });

  it('should filter messages based on log level', () => {
    logger.setLevel('ERROR');

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should accept valid log levels', () => {
    logger.setLevel('DEBUG');
    logger.setLevel('INFO');
    logger.setLevel('WARN');
    logger.setLevel('ERROR');
    logger.setLevel('info'); // lowercase should also work

    // Should not throw errors
    expect(() => logger.setLevel('INVALID')).not.toThrow();
  });

  it('should handle metadata in console transport', () => {
    logger.setLevel('INFO');
    const metadata = { userId: 123, action: 'click' };
    logger.info('User action', metadata);

    expect(console.info).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(metadata)));
  });

  it('should include timestamp in log output', () => {
    logger.setLevel('INFO');
    logger.info('Test message');

    // Check that console.info was called with a timestamp
    const call = console.info.mock.calls[0][0];
    expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should handle warn level correctly', () => {
    logger.setLevel('WARN');

    logger.debug('Debug');
    logger.info('Info');
    logger.warn('Warn');
    logger.error('Error');

    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should allow adding custom transports', () => {
    const customTransport = vi.fn();
    logger.addTransport(customTransport);

    logger.setLevel('INFO');
    logger.info('Test message');

    // Note: Custom transport won't be called in current implementation
    // as they're checked by reference. This tests the addTransport method exists
    expect(logger.transports.length).toBeGreaterThan(1);
  });

  it('should handle cases with no metadata', () => {
    logger.setLevel('INFO');
    logger.info('Test message without metadata');

    expect(console.info).toHaveBeenCalled();
    const call = console.info.mock.calls[0][0];
    expect(call).toContain('Test message without metadata');
  });

  it('should handle different log levels in consoleTransport', () => {
    logger.setLevel('DEBUG');

    logger.debug('Debug test');
    logger.info('Info test');
    logger.warn('Warn test');
    logger.error('Error test');

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid log level gracefully', () => {
    logger.setLevel('INVALID_LEVEL');
    // Should not throw error and should keep existing level
    logger.info('Test message');
    expect(console.info).toHaveBeenCalled();
  });

  it('should use console.log as fallback for unknown level', () => {
    // Directly call consoleTransport with unknown level
    logger.consoleTransport('UNKNOWN', 'test message', null);
    expect(console.log).toHaveBeenCalled();
  });
});
