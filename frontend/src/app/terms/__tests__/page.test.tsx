import { render, screen } from '@testing-library/react';
import TermsPage from '../page';

// Mock next/link to isolate testing
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

describe('Terms and Conditions Page', () => {
  beforeEach(() => {
    render(<TermsPage />);
  });

  it('renders the Terms & Conditions page header', () => {
    expect(screen.getByRole('heading', { name: /Terms & Conditions/i })).toBeInTheDocument();
  });

  it('renders the back to home link', () => {
    const link = screen.getByText('Back to Home');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders key definitions and terms text', () => {
    expect(screen.getAllByText(/Information Technology Act, 2000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Erina Assistance/i).length).toBeGreaterThan(0);
  });
});
