import { render, screen } from '@testing-library/react';
import RefundPage from '../page';

// Mock next/link to isolate testing
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

describe('Refund Policy Page', () => {
  beforeEach(() => {
    render(<RefundPage />);
  });

  it('renders the Refund Policy page header', () => {
    expect(screen.getByRole('heading', { name: /Refund Policy/i })).toBeInTheDocument();
  });

  it('renders the back to home link', () => {
    const link = screen.getByText('Back to Home');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders key refund rules and timelines', () => {
    expect(screen.getByText(/complete customer satisfaction with our Battery Sales/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Consumer Protection Act, 2019/i).length).toBeGreaterThan(0);
  });
});
