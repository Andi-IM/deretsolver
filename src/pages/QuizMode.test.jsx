import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import QuizMode from '@/pages/QuizMode';

// Mock modules
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock quizGenerator
vi.mock('@/utils/quizGenerator', () => ({
  generateQuestion: vi.fn(() => ({
    sequence: [2, 4, 6, 8],
    options: [10, 11, 12, 14],
    correctAnswer: 10,
    rule: { key: 'quiz.rules.arithmetic', data: { diff: 2 } },
    explanation: {
      key: 'quiz.explanations.arithmetic',
      data: { action: 'increases', absDiff: 2, last: 8, sign: '+', next: 10 },
    },
  })),
}));

describe('QuizMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render quiz page with header', () => {
    render(<QuizMode />);
    expect(screen.getByText('quiz.title')).toBeInTheDocument();
    expect(screen.getByText('quiz.description')).toBeInTheDocument();
  });

  it('should display difficulty badge', () => {
    render(<QuizMode />);
    expect(screen.getByText('quiz.difficulty.MEDIUM')).toBeInTheDocument();
  });

  it('should display streak counter', () => {
    render(<QuizMode />);
    expect(screen.getByText(/quiz.streak/)).toBeInTheDocument();
  });

  it('should display question sequence', () => {
    render(<QuizMode />);
    expect(screen.getByText('2,')).toBeInTheDocument();
    expect(screen.getByText('4,')).toBeInTheDocument();
    expect(screen.getByText('6,')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should display answer options', () => {
    render(<QuizMode />);
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '12' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '14' })).toBeInTheDocument();
  });

  it('should show correct feedback when selecting correct answer', async () => {
    const user = userEvent.setup();
    render(<QuizMode />);

    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    await waitFor(() => {
      expect(screen.getByText('quiz.feedback.correct')).toBeInTheDocument();
    });
  });

  it('should show incorrect feedback when selecting wrong answer', async () => {
    const user = userEvent.setup();
    render(<QuizMode />);

    const wrongOption = screen.getByRole('button', { name: '11' });
    await user.click(wrongOption);

    await waitFor(() => {
      expect(screen.getByText('quiz.feedback.incorrect')).toBeInTheDocument();
    });
  });

  it('should display rule and explanation after answering', async () => {
    const user = userEvent.setup();
    render(<QuizMode />);

    const option = screen.getByRole('button', { name: '10' });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByText(/quiz.rules.arithmetic/)).toBeInTheDocument();
      expect(screen.getByText('quiz.explanations.arithmetic')).toBeInTheDocument();
    });
  });

  it('should increase streak on correct answer', async () => {
    const user = userEvent.setup();
    render(<QuizMode />);

    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    await waitFor(() => {
      expect(screen.getByText(/quiz.streak/)).toBeInTheDocument();
    });
  });

  it('should reset streak on wrong answer', async () => {
    const user = userEvent.setup();
    render(<QuizMode />);

    // First correct answer
    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    await waitFor(() => {
      expect(screen.getByText(/quiz.streak/)).toBeInTheDocument();
    });
  });

  it('should show Next Question button after answering', async () => {
    const user = userEvent.setup();
    render(<QuizMode />);

    const option = screen.getByRole('button', { name: '10' });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'quiz.next_question' })).toBeInTheDocument();
    });
  });

  it('should load new question when Next Question is clicked', async () => {
    const user = userEvent.setup();
    const { generateQuestion } = await import('@/utils/quizGenerator');

    render(<QuizMode />);

    const option = screen.getByRole('button', { name: '10' });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'quiz.next_question' })).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'quiz.next_question' });
    await user.click(nextButton);

    // generateQuestion should be called again
    expect(generateQuestion).toHaveBeenCalledTimes(2);
  });

  it('should disable options after answering', async () => {
    const user = userEvent.setup();
    render(<QuizMode />);

    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '10' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '11' })).toBeDisabled();
    });
  });

  it('should handle generator error gracefully', async () => {
    const { generateQuestion } = await import('@/utils/quizGenerator');
    const logger = await import('@/utils/logger');

    generateQuestion.mockImplementationOnce(() => {
      throw new Error('Generation failed');
    });

    // This should not crash
    render(<QuizMode />);

    expect(logger.default.error).toHaveBeenCalledWith(
      'Failed to generate quiz question',
      expect.any(Error),
    );
  });
});
