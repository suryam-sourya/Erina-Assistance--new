import { render, screen, fireEvent } from '@testing-library/react';
import SuccessStoriesSection from '../SuccessStoriesSection';

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...rest }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
      <div className={className} data-testid="motion-div">{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock global.fetch for JSDOM compliance
beforeAll(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve({ success: true, testimonials: [] }),
    })
  ) as jest.Mock;
});

describe('SuccessStoriesSection', () => {
  beforeEach(() => {
    render(<SuccessStoriesSection />);
  });

  describe('Section Header', () => {
    it('renders the section heading', () => {
      expect(screen.getByText('Customer Success Stories')).toBeInTheDocument();
    });

    it('renders the subheading label', () => {
      expect(screen.getByText('Rescues & Testimonials')).toBeInTheDocument();
    });

    it('renders the section description', () => {
      expect(screen.getByText(/Real stories from drivers saved by Erina/i)).toBeInTheDocument();
    });
  });

  describe('Filter Buttons', () => {
    it('renders all filter buttons', () => {
      expect(screen.getByText('All Rescues')).toBeInTheDocument();
      expect(screen.getByText('Towing')).toBeInTheDocument();
      // 'Battery Jumpstart' appears as both a filter button and a card badge
      const batteryItems = screen.getAllByText('Battery Jumpstart');
      const batteryButton = batteryItems.find(el => el.tagName === 'BUTTON');
      expect(batteryButton).toBeDefined();
      expect(screen.getByText('EV Charge')).toBeInTheDocument();
      expect(screen.getByText('Lockout')).toBeInTheDocument();
    });

    it('shows all stories by default (All Rescues filter)', () => {
      expect(screen.getByText('Arjun Krishnan')).toBeInTheDocument();
      expect(screen.getByText('Sneha Reddy')).toBeInTheDocument();
      expect(screen.getByText('Dr. Vijay Shekhar')).toBeInTheDocument();
      expect(screen.getByText('Priya Mudaliar')).toBeInTheDocument();
    });

    it('filters stories when Towing button is clicked', () => {
      fireEvent.click(screen.getByText('Towing'));

      expect(screen.getByText('Sneha Reddy')).toBeInTheDocument();
      expect(screen.queryByText('Arjun Krishnan')).not.toBeInTheDocument();
      expect(screen.queryByText('Dr. Vijay Shekhar')).not.toBeInTheDocument();
      expect(screen.queryByText('Priya Mudaliar')).not.toBeInTheDocument();
    });

    it('filters stories when Battery Jumpstart button is clicked', () => {
      // Click the filter BUTTON specifically (not the card badge span)
      const batteryItems = screen.getAllByText('Battery Jumpstart');
      const batteryButton = batteryItems.find(el => el.tagName === 'BUTTON')!;
      fireEvent.click(batteryButton);

      expect(screen.getByText('Arjun Krishnan')).toBeInTheDocument();
      expect(screen.queryByText('Sneha Reddy')).not.toBeInTheDocument();
      expect(screen.queryByText('Dr. Vijay Shekhar')).not.toBeInTheDocument();
    });

    it('filters stories when EV Charge button is clicked', () => {
      fireEvent.click(screen.getByText('EV Charge'));

      expect(screen.getByText('Dr. Vijay Shekhar')).toBeInTheDocument();
      expect(screen.queryByText('Arjun Krishnan')).not.toBeInTheDocument();
      expect(screen.queryByText('Sneha Reddy')).not.toBeInTheDocument();
    });

    it('filters stories when Lockout button is clicked', () => {
      fireEvent.click(screen.getByText('Lockout'));

      expect(screen.getByText('Priya Mudaliar')).toBeInTheDocument();
      expect(screen.queryByText('Arjun Krishnan')).not.toBeInTheDocument();
      expect(screen.queryByText('Sneha Reddy')).not.toBeInTheDocument();
    });

    it('shows all stories again when All Rescues is clicked after filtering', () => {
      fireEvent.click(screen.getByText('Towing'));
      expect(screen.queryByText('Arjun Krishnan')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('All Rescues'));
      expect(screen.getByText('Arjun Krishnan')).toBeInTheDocument();
      expect(screen.getByText('Sneha Reddy')).toBeInTheDocument();
      expect(screen.getByText('Dr. Vijay Shekhar')).toBeInTheDocument();
      expect(screen.getByText('Priya Mudaliar')).toBeInTheDocument();
    });
  });

  describe('Story Cards Content', () => {
    it('renders story titles for all stories', () => {
      expect(screen.getByText(/Stranded at 2:30 AM/i)).toBeInTheDocument();
      expect(screen.getByText(/Heavy Downpour/i)).toBeInTheDocument();
      expect(screen.getByText(/EV Battery Depleted/i)).toBeInTheDocument();
      expect(screen.getByText(/Keys Locked Inside/i)).toBeInTheDocument();
    });

    it('renders the quote text for each story', () => {
      expect(screen.getByText(/My battery died while returning from Nandi Hills/i)).toBeInTheDocument();
      expect(screen.getByText(/During a massive storm on NICE Road/i)).toBeInTheDocument();
      expect(screen.getByText(/Got stuck in an unexpected 2-hour traffic jam/i)).toBeInTheDocument();
      expect(screen.getByText(/After a long shopping day/i)).toBeInTheDocument();
    });

    it('renders customer names', () => {
      expect(screen.getByText('Arjun Krishnan')).toBeInTheDocument();
      expect(screen.getByText('Sneha Reddy')).toBeInTheDocument();
      expect(screen.getByText('Dr. Vijay Shekhar')).toBeInTheDocument();
      expect(screen.getByText('Priya Mudaliar')).toBeInTheDocument();
    });

    it('renders customer roles', () => {
      expect(screen.getByText('Software Architect')).toBeInTheDocument();
      expect(screen.getByText('Product Designer')).toBeInTheDocument();
      expect(screen.getByText('Cardiologist')).toBeInTheDocument();
      expect(screen.getByText('Retail Manager')).toBeInTheDocument();
    });

    it('renders technician names', () => {
      expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument();
      expect(screen.getByText('Amit Singh')).toBeInTheDocument();
      expect(screen.getByText('Vikram Rao')).toBeInTheDocument();
      expect(screen.getByText('Nitesh Gowda')).toBeInTheDocument();
    });

    it('renders ETA badges', () => {
      expect(screen.getByText('22 Mins ETA')).toBeInTheDocument();
      expect(screen.getByText('28 Mins ETA')).toBeInTheDocument();
      expect(screen.getByText('18 Mins ETA')).toBeInTheDocument();
      expect(screen.getByText('15 Mins ETA')).toBeInTheDocument();
    });

    it('renders service type labels', () => {
      // 'Battery Jumpstart' appears in both filter button and card badge
      const batteryItems = screen.getAllByText('Battery Jumpstart');
      const batteryBadge = batteryItems.find(el => el.tagName !== 'BUTTON');
      expect(batteryBadge).toBeDefined();
      expect(screen.getByText('Flatbed Towing')).toBeInTheDocument();
      expect(screen.getByText('Mobile EV Charging')).toBeInTheDocument();
      expect(screen.getByText('Lockout Assistance')).toBeInTheDocument();
    });

    it('renders location pins for each story', () => {
      expect(screen.getByText(/Nandi Hills Road/i)).toBeInTheDocument();
      expect(screen.getByText(/NICE Road Expressway/i)).toBeInTheDocument();
      expect(screen.getByText(/Outer Ring Road/i)).toBeInTheDocument();
      expect(screen.getByText(/Phoenix Marketcity/i)).toBeInTheDocument();
    });

    it('renders verified rescue badges', () => {
      const badges = screen.getAllByText('Verified Rescue');
      expect(badges.length).toBe(4);
    });

    it('renders 5 star ratings for each story (20 stars total)', () => {
      // Each story has 5 stars, rendered as Star icons
      // They are SVGs rendered by lucide-react, but in our mock they become SVGs
      // We can check by looking at the star icon container
      const { container } = render(<SuccessStoriesSection />);
      const stars = container.querySelectorAll('.fill-yellow-400');
      expect(stars.length).toBeGreaterThanOrEqual(20); // 4 stories x 5 stars (at least the initial render)
    });
  });

  describe('Call to Action', () => {
    it('renders the CTA heading', () => {
      expect(screen.getByText(/Need immediate roadside assistance/i)).toBeInTheDocument();
    });

    it('renders the CTA description', () => {
      expect(screen.getByText(/Our dispatch center is operating 24 hours/i)).toBeInTheDocument();
    });

    it('renders the Get Rescued Now button', () => {
      expect(screen.getByText('Get Rescued Now')).toBeInTheDocument();
    });

    it('CTA links to the booking page', () => {
      const link = screen.getByText('Get Rescued Now').closest('a');
      expect(link).toHaveAttribute('href', '/booking');
    });
  });
});
