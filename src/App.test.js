import { render, screen } from '@testing-library/react';
import App from './App';

test('renders send button', () => {
  render(<App />);
  const element = screen.getByText(/Send ETH/i);
  expect(element).toBeInTheDocument();
});
