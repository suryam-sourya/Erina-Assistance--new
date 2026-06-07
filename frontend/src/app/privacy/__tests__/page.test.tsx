import { render, screen } from '@testing-library/react';
import PrivacyPage from '../page';

// Mock next/link to isolate testing
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

describe('Privacy Policy Page', () => {
  beforeEach(() => {
    render(<PrivacyPage />);
  });

  it('renders the Privacy Policy page header', () => {
    expect(screen.getByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument();
  });

  it('renders the back to home link', () => {
    const link = screen.getByText('Back to Home');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders key privacy explanations and text', () => {
    expect(screen.getByText(/Erina Assistance and its affiliates respect your privacy/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Privacy Officer/i).length).toBeGreaterThan(0);
  });
});
