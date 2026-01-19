import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CSCI Portal', () => {
  render(<App />);
  const linkElement = screen.getByText(/CSCI Portal/i);
  expect(linkElement).toBeInTheDocument();
});
