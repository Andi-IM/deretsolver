import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ResultSection from '@/components/ResultSection';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('ResultSection', () => {
  const mockResult = {
    type: 'Arithmetic',
    rule: 'Add 2 to each term',
    next: 10,
    predictions: [10, 12],
    visualization: {
      nodes: [
        { value: 2, label: 'i=0', isPrediction: false },
        { value: 4, label: 'i=1', isPrediction: false },
        { value: 6, label: 'i=2', isPrediction: false },
        { value: 8, label: 'i=3', isPrediction: false },
        { value: 10, label: 'NEXT', isPrediction: true },
      ],
      connections: [
        { fromIndex: 0, toIndex: 1, type: 'add', label: '+2' },
        { fromIndex: 1, toIndex: 2, type: 'add', label: '+2' },
        { fromIndex: 2, toIndex: 3, type: 'add', label: '+2' },
        { fromIndex: 3, toIndex: 4, type: 'add', label: '+2' },
      ],
    },
  };

  it('should not render when result is null', () => {
    const { container } = render(<ResultSection result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render result analysis section', () => {
    render(<ResultSection result={mockResult} />);
    expect(screen.getByText('result.analysis_title')).toBeInTheDocument();
    expect(screen.getByText('result.visualization_title')).toBeInTheDocument();
  });

  it('should display pattern type', () => {
    render(<ResultSection result={mockResult} />);
    expect(screen.getByText('result.pattern_type')).toBeInTheDocument();
    expect(screen.getByText('Arithmetic')).toBeInTheDocument();
  });

  it('should display rule', () => {
    render(<ResultSection result={mockResult} />);
    expect(screen.getByText('result.rule')).toBeInTheDocument();
    expect(screen.getByText('Add 2 to each term')).toBeInTheDocument();
  });

  it('should show success badge for normal result', () => {
    render(<ResultSection result={mockResult} />);
    expect(screen.getByText('result.success')).toBeInTheDocument();
    expect(screen.getByText('result.success_message')).toBeInTheDocument();
  });

  it('should show hint badge when isHint is true', () => {
    const hintResult = { ...mockResult, isHint: true };
    render(<ResultSection result={hintResult} />);
    expect(screen.getByText(/result.hint_title|Pattern Not Found/)).toBeInTheDocument();
  });

  it('should display single prediction', () => {
    const singlePrediction = { ...mockResult, predictions: undefined, next: 99 };
    render(<ResultSection result={singlePrediction} />);
    const elements = screen.getAllByText('99');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should display multiple predictions', () => {
    render(<ResultSection result={mockResult} />);
    expect(screen.getByText('result.predicted_next_plural')).toBeInTheDocument();
    // Check that predictions are rendered - use getAllByText since values appear multiple times
    const tens = screen.getAllByText('10');
    const twelves = screen.getAllByText('12');
    expect(tens.length).toBeGreaterThan(0);
    expect(twelves.length).toBeGreaterThan(0);
  });

  it('should render visualization with nodes', () => {
    render(<ResultSection result={mockResult} />);
    // Check for node values
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('should display connection labels', () => {
    render(<ResultSection result={mockResult} />);
    // Check for connection labels (+2)
    const plusTwoLabels = screen.getAllByText('+2');
    expect(plusTwoLabels.length).toBeGreaterThan(0);
  });

  it('should render legend items', () => {
    render(<ResultSection result={mockResult} />);
    expect(screen.getByText('result.legend.add')).toBeInTheDocument();
    expect(screen.getByText('result.legend.sub')).toBeInTheDocument();
    expect(screen.getByText('result.legend.mul')).toBeInTheDocument();
    expect(screen.getByText('result.legend.pow')).toBeInTheDocument();
  });

  it('should handle result without visualization', () => {
    const noVisualization = { ...mockResult, visualization: undefined };
    render(<ResultSection result={noVisualization} />);
    expect(screen.getByText('result.analysis_title')).toBeInTheDocument();
  });

  it('should handle result with empty connections', () => {
    const emptyConnections = {
      ...mockResult,
      visualization: { nodes: mockResult.visualization.nodes, connections: [] },
    };
    render(<ResultSection result={emptyConnections} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render arced connections for non-adjacent nodes', () => {
    const arcedResult = {
      ...mockResult,
      visualization: {
        nodes: mockResult.visualization.nodes,
        connections: [{ fromIndex: 0, toIndex: 2, type: 'mul', label: '×3' }],
      },
    };
    render(<ResultSection result={arcedResult} />);
    expect(screen.getByText('×3')).toBeInTheDocument();
  });

  it('should handle dashed connection lines', () => {
    const dashedResult = {
      ...mockResult,
      visualization: {
        nodes: mockResult.visualization.nodes,
        connections: [{ fromIndex: 0, toIndex: 1, type: 'add', label: '...' }],
      },
    };
    render(<ResultSection result={dashedResult} />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should display singular prediction label when only one prediction', () => {
    const singlePredictionArray = { ...mockResult, predictions: [42] };
    render(<ResultSection result={singlePredictionArray} />);
    expect(screen.getByText('result.predicted_next')).toBeInTheDocument();
  });

  it('should handle node without label (fallback to index)', () => {
    const noLabelNodes = {
      ...mockResult,
      visualization: {
        nodes: [
          { value: 1, isPrediction: false },
          { value: 2, isPrediction: false },
        ],
        connections: [],
      },
    };
    render(<ResultSection result={noLabelNodes} />);
    expect(screen.getByText('i=0')).toBeInTheDocument();
    expect(screen.getByText('i=1')).toBeInTheDocument();
  });

  it('should handle node with isPrediction and no label (shows NEXT)', () => {
    const predictionNoLabel = {
      ...mockResult,
      visualization: {
        nodes: [{ value: 99, isPrediction: true }],
        connections: [],
      },
    };
    render(<ResultSection result={predictionNoLabel} />);
    expect(screen.getByText('NEXT')).toBeInTheDocument();
  });

  it('should handle unknown connection type with fallback color', () => {
    const unknownType = {
      ...mockResult,
      visualization: {
        nodes: mockResult.visualization.nodes,
        connections: [{ fromIndex: 0, toIndex: 1, type: 'unknown', label: '?' }],
      },
    };
    render(<ResultSection result={unknownType} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should display hint message when isHint is true', () => {
    const hintResult = { ...mockResult, isHint: true };
    render(<ResultSection result={hintResult} />);
    expect(screen.getByText('result.hint_message')).toBeInTheDocument();
  });

  it('should render sub connection type', () => {
    const subResult = {
      ...mockResult,
      visualization: {
        nodes: mockResult.visualization.nodes,
        connections: [{ fromIndex: 0, toIndex: 1, type: 'sub', label: '-5' }],
      },
    };
    render(<ResultSection result={subResult} />);
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('should render pow connection type', () => {
    const powResult = {
      ...mockResult,
      visualization: {
        nodes: mockResult.visualization.nodes,
        connections: [{ fromIndex: 0, toIndex: 1, type: 'pow', label: '^2' }],
      },
    };
    render(<ResultSection result={powResult} />);
    expect(screen.getByText('^2')).toBeInTheDocument();
  });
});
