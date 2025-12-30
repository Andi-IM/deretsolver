import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import logger from '@/utils/logger';

import useFeedbackSubmission, { FEEDBACK_STATUS } from './useFeedbackSubmission';

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('useFeedbackSubmission Hook', () => {
  const mockResult = {
    type: 'Arithmetic',
    rule: 'Add 2',
    next: 10,
    predictions: [10, 12],
  };
  const mockInput = '2, 4, 6, 8';
  const mockGetRecaptchaToken = vi.fn().mockResolvedValue('test-token');

  // Default success mock
  const mockSubmitSuccess = vi.fn().mockResolvedValue({ id: 'doc-id' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with IDLE status', () => {
    const { result } = renderHook(() =>
      useFeedbackSubmission({
        result: mockResult,
        input: mockInput,
        getRecaptchaToken: mockGetRecaptchaToken,
      }),
    );
    expect(result.current.status).toBe(FEEDBACK_STATUS.IDLE);
  });

  describe('handleHelpful', () => {
    it('should handle successful submission', async () => {
      const { result } = renderHook(() =>
        useFeedbackSubmission({
          result: mockResult,
          input: mockInput,
          getRecaptchaToken: mockGetRecaptchaToken,
          submitFeedback: mockSubmitSuccess,
        }),
      );

      await act(async () => {
        await result.current.handleHelpful();
      });

      expect(result.current.status).toBe(FEEDBACK_STATUS.SUBMITTED);
      expect(mockSubmitSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          isHelpful: true,
          recaptchaToken: 'test-token',
        }),
      );
    });

    it('should handle submission error gracefully', async () => {
      const error = new Error('Network error');
      const mockSubmitFailure = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() =>
        useFeedbackSubmission({
          result: mockResult,
          input: mockInput,
          getRecaptchaToken: mockGetRecaptchaToken,
          submitFeedback: mockSubmitFailure,
        }),
      );

      await act(async () => {
        await result.current.handleHelpful();
      });

      // Needs waitFor because the state update happens after async rejection processing
      await waitFor(() => {
        expect(result.current.status).toBe(FEEDBACK_STATUS.SUBMITTED);
      });

      expect(logger.error).toHaveBeenCalledWith('Error adding document: ', error);
    });
  });

  describe('handleSubmitNotHelpful', () => {
    it('should transition to NOT_HELPFUL_FORM when handleNotHelpful is called', () => {
      const { result } = renderHook(() =>
        useFeedbackSubmission({
          result: mockResult,
          input: mockInput,
          getRecaptchaToken: mockGetRecaptchaToken,
        }),
      );

      act(() => {
        result.current.handleNotHelpful();
      });

      expect(result.current.status).toBe(FEEDBACK_STATUS.NOT_HELPFUL_FORM);
    });

    it('should not submit if reason is empty', async () => {
      const { result } = renderHook(() =>
        useFeedbackSubmission({
          result: mockResult,
          input: mockInput,
          getRecaptchaToken: mockGetRecaptchaToken,
          submitFeedback: mockSubmitSuccess,
        }),
      );

      // No reason set
      await act(async () => {
        await result.current.handleSubmitNotHelpful();
      });

      expect(result.current.status).toBe(FEEDBACK_STATUS.IDLE);
      expect(mockSubmitSuccess).not.toHaveBeenCalled();
    });

    it('should handle successful submission with reason', async () => {
      const { result } = renderHook(() =>
        useFeedbackSubmission({
          result: mockResult,
          input: mockInput,
          getRecaptchaToken: mockGetRecaptchaToken,
          submitFeedback: mockSubmitSuccess,
        }),
      );

      // Set state
      act(() => {
        result.current.setReason('incorrect');
        result.current.setComment('Wrong number');
      });

      await act(async () => {
        await result.current.handleSubmitNotHelpful();
      });

      expect(result.current.status).toBe(FEEDBACK_STATUS.SUBMITTED);
      expect(mockSubmitSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          isHelpful: false,
          reason: 'incorrect',
          comment: 'Wrong number',
        }),
      );
    });

    it('should handle submission error gracefully (User Request L97-98)', async () => {
      const error = new Error('Submission failed');
      const mockSubmitFailure = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() =>
        useFeedbackSubmission({
          result: mockResult,
          input: mockInput,
          getRecaptchaToken: mockGetRecaptchaToken,
          submitFeedback: mockSubmitFailure,
        }),
      );

      act(() => {
        result.current.setReason('other');
      });

      await act(async () => {
        await result.current.handleSubmitNotHelpful();
      });

      await waitFor(() => {
        expect(result.current.status).toBe(FEEDBACK_STATUS.SUBMITTED);
      });

      expect(logger.error).toHaveBeenCalledWith('Error adding document: ', error);
    });
  });

  describe('resetForm', () => {
    it('should reset state to default', () => {
      const { result } = renderHook(() =>
        useFeedbackSubmission({
          result: mockResult,
          input: mockInput,
          getRecaptchaToken: mockGetRecaptchaToken,
        }),
      );

      act(() => {
        result.current.setReason('foo');
        result.current.setComment('bar');
        result.current.handleNotHelpful();
      });

      expect(result.current.status).not.toBe(FEEDBACK_STATUS.IDLE);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.status).toBe(FEEDBACK_STATUS.IDLE);
      expect(result.current.reason).toBe('');
      expect(result.current.comment).toBe('');
    });
  });
});
