import '@testing-library/jest-dom';
import {render, screen, fireEvent} from '@testing-library/react';
import {MultiVariableSelector} from '@/components/common/multivariable-selector';

describe('MultiVariableSelector', () => {
  const mockSetVariables = jest.fn();
  const defaultProps = {
    variables: ['var1', 'var2', 'var3'],
    setVariables: mockSetVariables
  };

  beforeEach(() => {
    mockSetVariables.mockClear();
  });

  it('renders with default label', () => {
    render(<MultiVariableSelector {...defaultProps} />);
    expect(screen.getByText('Select variables')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<MultiVariableSelector {...defaultProps} label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('displays all variables as options', () => {
    render(<MultiVariableSelector {...defaultProps} />);
    defaultProps.variables.forEach(variable => {
      expect(screen.getByText(variable)).toBeInTheDocument();
    });
  });

  it('excludes specified variables', () => {
    render(<MultiVariableSelector {...defaultProps} excludeVariables={['var2']} />);
    expect(screen.getByText('var1')).toBeInTheDocument();
    expect(screen.queryByText('var2')).not.toBeInTheDocument();
    expect(screen.getByText('var3')).toBeInTheDocument();
  });

  it('shows invalid state', () => {
    render(<MultiVariableSelector {...defaultProps} isInvalid={true} />);
    const label = screen.getByText('Select variables');
    expect(label).toHaveClass('text-danger');
  });

  it('selects variables and displays chips', () => {
    render(<MultiVariableSelector {...defaultProps} />);

    // Select a variable
    fireEvent.click(screen.getByText('var1'));

    // Check if chip is displayed
    expect(screen.getAllByText('var1')).toHaveLength(2); // One in listbox, one in chip

    // Verify setVariables was called
    expect(mockSetVariables).toHaveBeenCalledWith(['var1']);
  });

  it('handles multiple selections', () => {
    render(<MultiVariableSelector {...defaultProps} />);

    fireEvent.click(screen.getByText('var1'));
    fireEvent.click(screen.getByText('var2'));

    expect(screen.getAllByText('var1')).toHaveLength(2);
    expect(screen.getAllByText('var2')).toHaveLength(2);
    expect(mockSetVariables).toHaveBeenLastCalledWith(['var1', 'var2']);
  });
});
