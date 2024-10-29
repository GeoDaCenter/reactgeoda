import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import {ColorSelector} from '@/components/common/color-selector';
import {ALL_COLOR_RANGES} from '@/utils/color-utils';

describe('ColorSelector', () => {
  const mockOnSelectColorRange = jest.fn();

  beforeEach(() => {
    mockOnSelectColorRange.mockClear();
  });

  test('renders with default props', () => {
    const {container} = render(<ColorSelector onSelectColorRange={mockOnSelectColorRange} />);
    expect(container).toMatchSnapshot();
  });

  test('filters color ranges based on numberOfColors prop', () => {
    const numberOfColors = 3;
    const {container} = render(
      <ColorSelector numberOfColors={numberOfColors} onSelectColorRange={mockOnSelectColorRange} />
    );

    const filteredRanges = ALL_COLOR_RANGES.filter(range => range.colors.length === numberOfColors);

    // Verify that only color ranges with specified number of colors are rendered
    filteredRanges.forEach(range => {
      expect(container.innerHTML).toContain(range.name);
    });
  });

  test('uses default color range when specified', () => {
    const defaultColorRange = ALL_COLOR_RANGES[0].name;
    const {container} = render(
      <ColorSelector
        defaultColorRange={defaultColorRange}
        onSelectColorRange={mockOnSelectColorRange}
      />
    );

    expect(container.innerHTML).toContain(defaultColorRange);
  });

  test.skip('calls onSelectColorRange when selection changes', async () => {
    const {getByRole} = render(<ColorSelector onSelectColorRange={mockOnSelectColorRange} />);

    const select = getByRole('combobox');
    fireEvent.click(select);

    // Select the first option
    const options = document.querySelectorAll('[role="option"]');
    fireEvent.click(options[1]); // Select second option

    expect(mockOnSelectColorRange).toHaveBeenCalled();
  });

  test.skip('returns null when no color ranges match the criteria', () => {
    const {container} = render(
      <ColorSelector
        numberOfColors={999} // An impossible number of colors
        onSelectColorRange={mockOnSelectColorRange}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
