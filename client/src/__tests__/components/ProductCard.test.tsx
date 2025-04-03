
import { render } from '@testing-library/react';
import ProductCard from '../../components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    activeIngredient: 'Test Ingredient',
    applicationRate: '1-2 units per area',
    safetyPrecautions: ['Wear gloves', 'Avoid contact with skin'],
    advice: 'Apply carefully'
  };

  it('should render product details correctly', () => {
    const { getByText } = render(<ProductCard product={mockProduct} />);
    
    expect(getByText('Test Product')).toBeInTheDocument();
    expect(getByText('Test Ingredient')).toBeInTheDocument();
    expect(getByText('1-2 units per area')).toBeInTheDocument();
  });
});
