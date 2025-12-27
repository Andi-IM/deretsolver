import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FeedbackDialog from './FeedbackDialog';

// Mock modules
vi.mock('../utils/logger', () => ({
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

vi.mock('../utils/firebase', () => ({
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

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup grecaptcha mock
    global.window.grecaptcha = {
      ready: vi.fn((callback) => callback()),
      execute: vi.fn(() => Promise.resolve('mock-recaptcha-token')),
    };
  });

  afterEach(() => {
    delete global.window.grecaptcha;
  });

  it('should not render when result is null', () => {
    const { container } = render(<FeedbackDialog result={null} input={mockInput} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render feedback dialog when result is provided', () => {
    render(<FeedbackDialog result={mockResult} input={mockInput} />);
    expect(screen.getByText('feedback.title')).toBeInTheDocument();
    expect(screen.getByText('feedback.question')).toBeInTheDocument();
  });

  it('should show initial state with yes/no buttons', () => {
    render(<FeedbackDialog result={mockResult} input={mockInput} />);
    expect(screen.getByRole('button', { name: /feedback.yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /feedback.no/i })).toBeInTheDocument();
  });

  it('should show thank you message after clicking helpful', async () => {
    const user = userEvent.setup();
    const { addDoc } = await import('firebase/firestore');

    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.thank_you')).toBeInTheDocument();
    });

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
    const user = userEvent.setup();
    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.issue_prompt')).toBeInTheDocument();
    });
  });

  it('should submit not helpful feedback with reason and comment', async () => {
    const user = userEvent.setup();
    const { addDoc } = await import('firebase/firestore');

    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.issue_prompt')).toBeInTheDocument();
    });

    const incorrectButton = screen.getByRole('button', { name: /feedback.reasons.incorrect/i });
    await user.click(incorrectButton);

    const commentTextarea = screen.getByPlaceholderText('feedback.details_placeholder');
    await user.type(commentTextarea, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.thank_you')).toBeInTheDocument();
    });

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
    const user = userEvent.setup();
    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('should allow cancel from not helpful form', async () => {
    const user = userEvent.setup();
    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.issue_prompt')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /feedback.cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.question')).toBeInTheDocument();
    });
  });

  it('should handle Firebase submission error gracefully', async () => {
    const user = userEvent.setup();
    const { addDoc } = await import('firebase/firestore');
    const logger = await import('../utils/logger');

    addDoc.mockRejectedValueOnce(new Error('Firebase error'));

    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.thank_you')).toBeInTheDocument();
    });

    expect(logger.default.error).toHaveBeenCalled();
  });

  it('should handle result with only next property', async () => {
    const user = userEvent.setup();
    const { addDoc } = await import('firebase/firestore');

    const resultWithOnlyNext = {
      id: 'test-2',
      type: 'geometric',
      rule: 'multiply',
      next: '16',
    };

    render(<FeedbackDialog result={resultWithOnlyNext} input={mockInput} />);

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
    const user = userEvent.setup();
    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.issue_prompt')).toBeInTheDocument();
    });

    const unclearButton = screen.getByRole('button', { name: /feedback.reasons.unclear/i });
    await user.click(unclearButton);

    const submitButton = screen.getByRole('button', { name: /feedback.submit/i });
    expect(submitButton).not.toBeDisabled();

    const otherButton = screen.getByRole('button', { name: /feedback.reasons.other/i });
    await user.click(otherButton);

    expect(submitButton).not.toBeDisabled();
  });

  it('should handle reCAPTCHA not available during token generation', async () => {
    const user = userEvent.setup();
    const { addDoc } = await import('firebase/firestore');
    const logger = await import('../utils/logger');

    // Remove grecaptcha after component mounts
    delete global.window.grecaptcha;

    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.thank_you')).toBeInTheDocument();
    });

    // Should still submit with null token
    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        recaptchaToken: null,
      }),
    );

    expect(logger.default.warn).toHaveBeenCalledWith(
      'reCAPTCHA not ready, skipping token generation',
    );
  });

  it('should handle reCAPTCHA execute failure', async () => {
    const user = userEvent.setup();
    const logger = await import('../utils/logger');

    // Mock grecaptcha.execute to fail
    global.window.grecaptcha = {
      ready: vi.fn((callback) => callback()),
      execute: vi.fn(() => Promise.reject(new Error('reCAPTCHA error'))),
    };

    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    await waitFor(() => {
      expect(logger.default.error).toHaveBeenCalledWith(
        'Failed to execute reCAPTCHA:',
        expect.any(Error),
      );
    });
  });

  it('should show submitting state while processing feedback', async () => {
    const user = userEvent.setup();
    const { addDoc } = await import('firebase/firestore');

    // Make addDoc slow
    addDoc.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ id: 'test-id' }), 100);
        }),
    );

    render(<FeedbackDialog result={mockResult} input={mockInput} />);

    const yesButton = screen.getByRole('button', { name: /feedback.yes/i });
    await user.click(yesButton);

    // Should show submitting state
    expect(screen.getByText('feedback.sending')).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('feedback.thank_you')).toBeInTheDocument();
    });
  });

  it('should handle undefined result properties gracefully', async () => {
    const user = userEvent.setup();
    const { addDoc } = await import('firebase/firestore');

    const incompleteResult = {
      id: 'test-3',
    };

    render(<FeedbackDialog result={incompleteResult} input={mockInput} />);

    const noButton = screen.getByRole('button', { name: /feedback.no/i });
    await user.click(noButton);

    await waitFor(() => {
      expect(screen.getByText('feedback.issue_prompt')).toBeInTheDocument();
    });

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
});
