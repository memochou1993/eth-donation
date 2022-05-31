import React, { render, screen } from '@testing-library/react';
import App from './App';

test('renders donate button', () => {
  render(<App />);
  const element = screen.getByText(/Donate ETH/i);
  expect(element).toBeInTheDocument();
});
