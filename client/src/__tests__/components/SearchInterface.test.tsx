
import { render, fireEvent } from '@testing-library/react';
import SearchInterface from '../../components/SearchInterface';

describe('SearchInterface', () => {
  it('should call onSearch when search is performed', () => {
    const mockOnSearch = jest.fn();
    const { getByRole } = render(<SearchInterface onSearch={mockOnSearch} />);
    
    const searchInput = getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'ants' } });
    fireEvent.submit(searchInput);
    
    expect(mockOnSearch).toHaveBeenCalledWith('ants');
  });
});
