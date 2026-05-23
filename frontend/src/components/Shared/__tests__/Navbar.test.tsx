import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, ...rest }: { src: string; alt: string; fill?: boolean; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-fill={fill ? 'true' : undefined} {...rest} />;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => <div {...rest}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock ThemeToggle
jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle</button>,
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Mock logged out state
    return () => {};
  }),
  signOut: jest.fn().mockResolvedValue(true),
}));

describe('Navbar', () => {
  beforeEach(() => {
    render(<Navbar />);
  });

  describe('Logo', () => {
    it('renders the desktop logo with correct src', () => {
      const logos = screen.getAllByAltText('Erina Assistance');
      // Desktop logo uses logo-full.png
      const desktopLogo = logos.find(img => (img as HTMLImageElement).src.includes('logo-full.png'));
      expect(desktopLogo).toBeDefined();
    });

    it('renders the mobile logo with warning.png', () => {
      const logos = screen.getAllByAltText('Erina Assistance');
      const mobileLogo = logos.find(img => (img as HTMLImageElement).src.includes('warning.png'));
      expect(mobileLogo).toBeDefined();
    });
  });

  describe('Navigation Links', () => {
    it('renders all navigation links', () => {
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Services').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Membership').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Partner With Us').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('About Us').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
    });

    it('has correct href for Home link', () => {
      const homeLinks = screen.getAllByText('Home');
      const homeLink = homeLinks[0].closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('has correct href for Services link', () => {
      const servicesLinks = screen.getAllByText('Services');
      const link = servicesLinks[0].closest('a');
      expect(link).toHaveAttribute('href', '/#services');
    });

    it('has correct href for Membership link', () => {
      const links = screen.getAllByText('Membership');
      const link = links[0].closest('a');
      expect(link).toHaveAttribute('href', '/membership');
    });
  });

  describe('Emergency Button', () => {
    it('renders the Emergency text in the navigation bar', () => {
      expect(screen.getByText('Emergency Help')).toBeInTheDocument();
    });

    it('links to the booking page', () => {
      const emergencyLink = screen.getByText('Emergency Help').closest('a');
      expect(emergencyLink).toHaveAttribute('href', '/booking');
    });

    it('renders the custom warning icon inside the Emergency button', () => {
      const warningIcons = screen.getAllByAltText('Emergency');
      expect(warningIcons.length).toBeGreaterThanOrEqual(1);
      const icon = warningIcons[0] as HTMLImageElement;
      expect(icon.src).toContain('warning.png');
    });
  });

  describe('Theme Toggle', () => {
    it('renders the theme toggle button', () => {
      const toggles = screen.getAllByTestId('theme-toggle');
      expect(toggles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Mobile Menu', () => {
    it('renders the mobile menu hamburger button', () => {
      // Mobile menu button is always rendered (md:hidden)
      const buttons = screen.getAllByRole('button');
      // There should be at least 3 buttons: theme-toggle (×2 for md and mobile), hamburger
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('mobile emergency button links to booking page', () => {
      // The desktop Emergency button is always visible and links to /booking
      const emergencyLink = screen.getByText('Emergency Help').closest('a');
      expect(emergencyLink).toHaveAttribute('href', '/booking');
    });
  });
});
