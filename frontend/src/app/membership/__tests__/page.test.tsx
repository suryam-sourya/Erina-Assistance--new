import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MembershipPage from '../page';

// Mock fetch for API call
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock IntersectionObserver for Framer Motion's whileInView
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockUnobserve = jest.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = mockUnobserve;
  takeRecords = () => [];
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

describe('Membership Page', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockUnobserve.mockClear();
    render(<MembershipPage />);
  });

  it('renders membership plans correctly', () => {
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Fleet')).toBeInTheDocument();

    expect(screen.getByText('Get Basic Plan')).toBeInTheDocument();
    expect(screen.getByText('Get Premium Plan')).toBeInTheDocument();
    expect(screen.getByText('Contact Sales')).toBeInTheDocument();
  });

  it('opens modal when clicking a plan button', () => {
    const basicBtn = screen.getByText('Get Basic Plan');
    fireEvent.click(basicBtn);

    // Modal should be open and display text
    expect(screen.getByText('Join Erina Assistance')).toBeInTheDocument();
    expect(screen.getByText('Basic Plan Selection')).toBeInTheDocument();
  });

  it('submits form successfully and shows confirmation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const basicBtn = screen.getByText('Get Basic Plan');
    fireEvent.click(basicBtn);

    // Fill in the form fields
    const nameInput = screen.getByPlaceholderText('e.g. Rahul Sharma');
    const phoneInput = screen.getByPlaceholderText('e.g. 9876543210');
    const emailInput = screen.getByPlaceholderText('e.g. rahul@gmail.com');
    const submitBtn = screen.getByText('Submit Subscription Request');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '9988776655' } });
    fireEvent.change(emailInput, { target: { value: 'john@doe.com' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Inquiry Submitted!')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/membership/inquiry', expect.any(Object));
  });
});
