import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDoc } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FeedbackDialog from '@/components/FeedbackDialog';
import * as useRecaptchaHook from '@/hooks/useRecaptcha';
import logger from '@/utils/logger';

// Mock modules
vi.mock('@/hooks/useRecaptcha', () => ({
  defaultLoadRecaptchaScript: vi.fn(),
  useRecaptcha: vi.fn(),
}));

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('@/utils/firebase', () => ({
  initializeFirebase: vi.fn(() =>
    Promise.resolve({
      db: {},
    }),
  ),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

describe('FeedbackDialog', () => {
  const mockResult = {
    id: 'test-result-1',
    type: 'arithmetic',
    rule: 'addition',
    predictions: ['5', '7', '9'],
    next: '11',
  };

  const mockInput = '1, 3, 5, 7, 9';

  const setup = (props = {}) => {
    return {
      user: userEvent.setup({ delay: null }),
      ...render(
        <FeedbackDialog
          result={props.result !== undefined ? props.result : mockResult}
          input={props.input || mockInput}
          {...props}
        />,
      ),
    };
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementation for useRecaptcha
    useRecaptchaHook.useRecaptcha.mockReturnValue({
      isRecaptchaReady: true,
      getRecaptchaToken: vi.fn(() => Promise.resolve('mock-recaptcha-token')),
    });
  });

  it('should not render when result is null', () => {
    const { container } = render(<FeedbackDialog result={null} input={mockInput} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render feedback dialog when result is provided', () => {
    setup();
    expect(screen.getByText('feedback.title')).toBeInTheDocument();
    expect(screen.getByText('feedback.question')).toBeInTheDocument();
  });

  it('should show initial state with yes/no buttons', () => {
    setup();
    expect(screen.getByRole('button', { name: /feedback.yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /feedback.no/i })).toBeInTheDocument();
  });

  it('should show thank you message after clicking helpful', async () => {
    const { user } = setup();

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    expect(await screen.findByText('feedback.thank_you')).toBeInTheDocument();

    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        isHelpful: true,
        question: mockInput,
        answer: mockResult.predictions.join(', '),
        resultType: mockResult.type,
        resultRule: mockResult.rule,
        recaptchaToken: 'mock-recaptcha-token',
      }),
    );
  });

  it('should show not helpful form after clicking not helpful', async () => {
    const { user } = setup();

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    expect(await screen.findByText('feedback.issue_prompt')).toBeInTheDocument();
  });

  it('should submit not helpful feedback with reason and comment', async () => {
    const { user } = setup();

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    expect(await screen.findByText('feedback.issue_prompt')).toBeInTheDocument();

    const incorrectButton = screen.getByRole('button', { name: /feedback.reasons.incorrect/i });
    await user.click(incorrectButton);

    const commentTextarea = screen.getByPlaceholderText('feedback.details_placeholder');
    await user.type(commentTextarea, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
    await user.click(submitButton);

    expect(await screen.findByText('feedback.thank_you')).toBeInTheDocument();

    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        isHelpful: false,
        reason: 'Incorrect Result',
        comment: 'Test comment',
        question: mockInput,
        resultType: mockResult.type,
        resultRule: mockResult.rule,
        recaptchaToken: 'mock-recaptcha-token',
      }),
    );
  });

  it('should disable submit button when no reason is selected', async () => {
    const { user } = setup();

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    // Wait for the form to appear
    await screen.findByText('feedback.issue_prompt');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('should allow cancel from not helpful form', async () => {
    const { user } = setup();

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    expect(await screen.findByText('feedback.issue_prompt')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /feedback.cancel/i });
    await user.click(cancelButton);

    expect(await screen.findByText('feedback.question')).toBeInTheDocument();
  });

  it('should handle Firebase submission error gracefully', async () => {
    const { user } = setup();
    addDoc.mockRejectedValueOnce(new Error('Firebase error'));

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    expect(await screen.findByText('feedback.thank_you')).toBeInTheDocument();

    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle result with only next property', async () => {
    const resultWithOnlyNext = {
      id: 'test-2',
      type: 'geometric',
      rule: 'multiply',
      next: '16',
    };

    const { user } = setup({ result: resultWithOnlyNext });

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          answer: '16',
        }),
      );
    });
  });

  it('should select different reason options', async () => {
    const { user } = setup();

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    expect(await screen.findByText('feedback.issue_prompt')).toBeInTheDocument();

    const unclearButton = screen.getByRole('button', { name: /feedback.reasons.unclear/i });
    await user.click(unclearButton);

    const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
    expect(submitButton).not.toBeDisabled();

    const otherButton = screen.getByRole('button', { name: /feedback.reasons.other/i });
    await user.click(otherButton);

    expect(submitButton).not.toBeDisabled();
  });

  it('should handle reCAPTCHA not available during token generation', async () => {
    // Mock getRecaptchaToken to return null and log warning
    useRecaptchaHook.useRecaptcha.mockReturnValue({
      isRecaptchaReady: false,
      getRecaptchaToken: vi.fn(() => {
        logger.warn('reCAPTCHA not ready, skipping token generation');
        return Promise.resolve(null);
      }),
    });

    const { user } = setup();

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    expect(await screen.findByText('feedback.thank_you')).toBeInTheDocument();

    // Should still submit with null token
    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        recaptchaToken: null,
      }),
    );

    expect(logger.warn).toHaveBeenCalledWith('reCAPTCHA not ready, skipping token generation');
  });

  it('should handle reCAPTCHA execute failure', async () => {
    // Mock getRecaptchaToken to fail
    useRecaptchaHook.useRecaptcha.mockReturnValue({
      isRecaptchaReady: true,
      getRecaptchaToken: vi.fn(() => Promise.reject(new Error('reCAPTCHA error'))),
    });

    const { user } = setup();

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Error adding document: ', expect.any(Error));
    });
  });

  it('should show submitting state while processing feedback', async () => {
    const { user } = setup();

    // Make addDoc slow
    addDoc.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ id: 'test-id' }), 10);
        }),
    );

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    // Should show submitting state
    expect(screen.getByText('feedback.sending')).toBeInTheDocument();

    // Wait for completion
    expect(await screen.findByText('feedback.thank_you')).toBeInTheDocument();
  });

  it('should handle undefined result properties gracefully', async () => {
    const incompleteResult = {
      id: 'test-3',
    };

    const { user } = setup({ result: incompleteResult });

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    expect(await screen.findByText('feedback.issue_prompt')).toBeInTheDocument();

    const incorrectButton = screen.getByRole('button', { name: /feedback.reasons.incorrect/i });
    await user.click(incorrectButton);

    const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          resultType: 'unknown',
          resultRule: 'unknown',
        }),
      );
    });
  });

  // =====================
  // NEW TESTS FOR DI COVERAGE
  // =====================

  it('should call injected loadRecaptchaScript on mount', async () => {
    const mockLoadRecaptcha = vi.fn(() => Promise.resolve());
    const mockSubmitFeedback = vi.fn(() => Promise.resolve());

    // Update mock to call the loader
    useRecaptchaHook.useRecaptcha.mockImplementation((loader) => {
      if (loader) loader();
      return {
        isRecaptchaReady: true,
        getRecaptchaToken: vi.fn(),
      };
    });

    setup({
      loadRecaptchaScript: mockLoadRecaptcha,
      submitFeedback: mockSubmitFeedback,
    });

    await waitFor(() => {
      expect(mockLoadRecaptcha).toHaveBeenCalled();
    });
  });

  it('should use injected submitFeedback when helpful is clicked', async () => {
    const mockSubmitFeedback = vi.fn(() => Promise.resolve());
    const { user } = setup({ submitFeedback: mockSubmitFeedback });

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(mockSubmitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          isHelpful: true,
          question: mockInput,
        }),
      );
    });
  });

  it('should use injected submitFeedback when not helpful is submitted', async () => {
    const mockSubmitFeedback = vi.fn(() => Promise.resolve());
    const { user } = setup({ submitFeedback: mockSubmitFeedback });

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    expect(await screen.findByText('feedback.issue_prompt')).toBeInTheDocument();

    const incorrectButton = screen.getByRole('button', { name: /feedback.reasons.incorrect/i });
    await user.click(incorrectButton);

    const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          isHelpful: false,
          reason: 'Incorrect Result',
        }),
      );
    });
  });

  it('should handle submitFeedback failure gracefully', async () => {
    const mockSubmitFeedback = vi.fn(() => Promise.reject(new Error('Submit failed')));
    const { user } = setup({ submitFeedback: mockSubmitFeedback });

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Error adding document: ', expect.any(Error));
      // Should still show thank you (optimistic UI)
      expect(screen.getByText('feedback.thank_you')).toBeInTheDocument();
    });
  });
});
