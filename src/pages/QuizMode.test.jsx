import { MemoryRouter } from 'react-router-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import QuizMode from '@/pages/QuizMode';
import logger from '@/utils/logger';
import { generateQuestion } from '@/utils/quizGenerator';

// Mock modules
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
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

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('QuizMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    return {
      user: userEvent.setup({ delay: null }),
      ...renderWithRouter(<QuizMode />),
    };
  };

  it('should render quiz page with header', () => {
    setup();
    expect(screen.getByText('quiz.title')).toBeInTheDocument();
    expect(screen.getByText('quiz.description')).toBeInTheDocument();
  });

  it('should display difficulty badge', () => {
    setup();
    // Fixed: Now there are multiple instances (badge and selector)
    expect(screen.getAllByText('quiz.difficulty.MEDIUM')[0]).toBeInTheDocument();
  });

  it('should display streak counter', () => {
    setup();
    expect(screen.getByText(/quiz.streak/)).toBeInTheDocument();
  });

  it('should display question sequence', () => {
    setup();
    expect(screen.getByText('2,')).toBeInTheDocument();
    expect(screen.getByText('4,')).toBeInTheDocument();
    expect(screen.getByText('6,')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should display answer options', () => {
    setup();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '12' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '14' })).toBeInTheDocument();
  });

  it('should show correct feedback when selecting correct answer', async () => {
    const { user } = setup();

    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    expect(await screen.findByText('quiz.feedback.correct')).toBeInTheDocument();
  });

  it('should show incorrect feedback when selecting wrong answer', async () => {
    const { user } = setup();

    const wrongOption = screen.getByRole('button', { name: '11' });
    await user.click(wrongOption);

    expect(await screen.findByText('quiz.feedback.incorrect')).toBeInTheDocument();
  });

  it('should display rule and explanation after answering', async () => {
    const { user } = setup();

    const option = screen.getByRole('button', { name: '10' });
    await user.click(option);

    expect(await screen.findByText(/quiz.rules.arithmetic/)).toBeInTheDocument();
    expect(screen.getByText('quiz.explanations.arithmetic')).toBeInTheDocument();
  });

  it('should increase streak on correct answer', async () => {
    const { user } = setup();

    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    expect(await screen.findByText(/quiz.streak/)).toBeInTheDocument();
  });

  it('should reset streak on wrong answer', async () => {
    const { user } = setup();

    // First correct answer
    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    expect(await screen.findByText(/quiz.streak/)).toBeInTheDocument();
  });

  it('should show Next Question button after answering', async () => {
    const { user } = setup();

    const option = screen.getByRole('button', { name: '10' });
    await user.click(option);

    expect(await screen.findByRole('button', { name: 'quiz.next_question' })).toBeInTheDocument();
  });

  it('should load new question when Next Question is clicked', async () => {
    const { user } = setup();

    const option = screen.getByRole('button', { name: '10' });
    await user.click(option);

    const nextButton = await screen.findByRole('button', { name: 'quiz.next_question' });
    await user.click(nextButton);

    // generateQuestion should be called again
    expect(generateQuestion).toHaveBeenCalledTimes(2);
  });

  it('should disable options after answering', async () => {
    const { user } = setup();

    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '10' })).toBeDisabled();
    });
  });

  it('should prevent changing answer after selection', async () => {
    const { user } = setup();

    const correctOption = screen.getByRole('button', { name: '10' });
    const wrongOption = screen.getByRole('button', { name: '11' });

    // Click correct option first
    await user.click(correctOption);

    // Try to click wrong option
    await user.click(wrongOption);

    // Should still show correct feedback, not switch to incorrect
    expect(await screen.findByText('quiz.feedback.correct')).toBeInTheDocument();
    expect(screen.queryByText('quiz.feedback.incorrect')).not.toBeInTheDocument();
  });

  it('should handle generator error gracefully', async () => {
    generateQuestion.mockImplementationOnce(() => {
      throw new Error('Generation failed');
    });

    setup();

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to generate quiz question',
      expect.any(Error),
    );
  });

  it('should change difficulty and reset streak when clicked', async () => {
    const { user } = setup();

    // Mock generateQuestion to track calls
    generateQuestion.mockClear();

    // 1. Answer correctly to increase streak
    const correctOption = screen.getByRole('button', { name: '10' });
    await user.click(correctOption);
    expect(await screen.findByText('quiz.streak')).toBeInTheDocument();

    // 2. Go to next question to see selectors
    const nextButton = await screen.findByRole('button', { name: 'quiz.next_question' });
    await user.click(nextButton);

    // Now selectors should be visible
    const hardButton = screen.getByRole('button', { name: 'quiz.difficulty.HARD' });

    // Clear mock to track new call
    generateQuestion.mockClear();

    await user.click(hardButton);

    // 1. Difficulty changed -> Triggered new question generation with 'HARD'
    expect(generateQuestion).toHaveBeenCalledWith('HARD');

    // 2. Streak reset
    expect(screen.getByText('quiz.streak')).toBeInTheDocument();

    expect(hardButton).toHaveClass('bg-slate-800');
  });
});
