/* eslint-disable no-console */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LOG_LEVELS,
  Logger,
  createConsoleTransport,
  createFirebaseTransport,
} from '@/utils/logger';
import logger from '@/utils/logger';

describe('Logger with Dependency Injection', () => {
  // Create a mock console for testing
  const createMockConsole = () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  });

  describe('createConsoleTransport', () => {
    it('should call debug for DEBUG level', () => {
      const mockConsole = createMockConsole();
      const transport = createConsoleTransport(mockConsole);

      transport('DEBUG', 'test message', null);

      expect(mockConsole.debug).toHaveBeenCalledWith(expect.stringContaining('test message'));
    });

    it('should call info for INFO level', () => {
      const mockConsole = createMockConsole();
      const transport = createConsoleTransport(mockConsole);

      transport('INFO', 'info message', null);

      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('info message'));
    });

    it('should call warn for WARN level', () => {
      const mockConsole = createMockConsole();
      const transport = createConsoleTransport(mockConsole);

      transport('WARN', 'warning', null);

      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('warning'));
    });

    it('should call error for ERROR level', () => {
      const mockConsole = createMockConsole();
      const transport = createConsoleTransport(mockConsole);

      transport('ERROR', 'error message', null);

      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('error message'));
    });

    it('should call log for unknown level', () => {
      const mockConsole = createMockConsole();
      const transport = createConsoleTransport(mockConsole);

      transport('UNKNOWN', 'unknown level', null);

      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('unknown level'));
    });

    it('should include timestamp in output', () => {
      const mockConsole = createMockConsole();
      const transport = createConsoleTransport(mockConsole);

      transport('INFO', 'test', null);

      const output = mockConsole.info.mock.calls[0][0];
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include metadata when provided', () => {
      const mockConsole = createMockConsole();
      const transport = createConsoleTransport(mockConsole);

      transport('INFO', 'test', { userId: 123 });

      const output = mockConsole.info.mock.calls[0][0];
      expect(output).toContain('"userId":123');
    });
  });

  describe('createFirebaseTransport', () => {
    it('should skip non-error/warn levels', async () => {
      const mockGetter = vi.fn();
      const transport = createFirebaseTransport(mockGetter);

      await transport('INFO', 'info message', null);
      await transport('DEBUG', 'debug message', null);

      expect(mockGetter).not.toHaveBeenCalled();
    });

    it('should call getter for ERROR level', async () => {
      const mockAnalytics = { name: 'mock-analytics' };
      const mockGetter = vi.fn().mockResolvedValue(mockAnalytics);
      const transport = createFirebaseTransport(mockGetter);

      // Mock the firebase/analytics import
      vi.mock('firebase/analytics', () => ({
        logEvent: vi.fn(),
      }));

      await transport('ERROR', 'error message', null);

      expect(mockGetter).toHaveBeenCalled();
    });

    it('should call getter for WARN level', async () => {
      const mockAnalytics = { name: 'mock-analytics' };
      const mockGetter = vi.fn().mockResolvedValue(mockAnalytics);
      const transport = createFirebaseTransport(mockGetter);

      await transport('WARN', 'warning message', null);

      expect(mockGetter).toHaveBeenCalled();
    });
  });

  describe('Logger class', () => {
    let testLogger;
    let mockConsole;

    beforeEach(() => {
      mockConsole = createMockConsole();
      testLogger = new Logger({ console: mockConsole });
    });

    afterEach(() => {
      testLogger.reset();
    });

    it('should use injected console', () => {
      testLogger.info('test message');

      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('should respect log level filtering', () => {
      testLogger.setLevel('WARN');

      testLogger.debug('debug');
      testLogger.info('info');
      testLogger.warn('warn');
      testLogger.error('error');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should set level to DEBUG', () => {
      testLogger.setLevel('DEBUG');

      testLogger.debug('debug message');

      expect(mockConsole.debug).toHaveBeenCalled();
    });

    it('should get current level', () => {
      testLogger.setLevel('ERROR');

      expect(testLogger.getLevel()).toBe('ERROR');
    });

    it('should ignore invalid log levels', () => {
      const originalLevel = testLogger.level;
      testLogger.setLevel('INVALID');

      expect(testLogger.level).toBe(originalLevel);
    });

    it('should add custom transport', () => {
      const customTransport = vi.fn();
      testLogger.addTransport(customTransport);

      testLogger.info('test');

      expect(customTransport).toHaveBeenCalledWith('INFO', 'test', undefined);
    });

    it('should remove transport', () => {
      const customTransport = vi.fn();
      testLogger.addTransport(customTransport);
      testLogger.removeTransport(customTransport);

      testLogger.info('test');

      expect(customTransport).not.toHaveBeenCalled();
    });

    it('should clear all transports', () => {
      testLogger.clearTransports();

      testLogger.info('test');

      // No console call since transports are cleared
      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('should reset to initial state', () => {
      testLogger.setLevel('ERROR');
      testLogger.clearTransports();

      testLogger.reset();

      expect(testLogger.level).toBe(LOG_LEVELS.INFO);
      expect(testLogger.transports.length).toBe(1);
    });

    it('should handle metadata in log calls', () => {
      testLogger.warn('test', { key: 'value' });

      const output = mockConsole.warn.mock.calls[0][0];
      expect(output).toContain('"key":"value"');
    });
  });

  describe('default logger singleton', () => {
    beforeEach(() => {
      vi.spyOn(console, 'info').mockImplementation(() => {});
      logger.reset();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      logger.reset();
    });

    it('should exist as singleton', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('should log to real console', () => {
      logger.info('singleton test');

      expect(console.info).toHaveBeenCalled();
    });
  });
});
