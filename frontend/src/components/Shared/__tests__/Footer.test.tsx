import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...rest}>{children}</a>;
  };
});

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  };
});

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  describe('Brand Section', () => {
    it('renders the Erina Assistance logo', () => {
      const logo = screen.getByAltText('Erina Assistance') as HTMLImageElement;
      expect(logo).toBeInTheDocument();
      expect(logo.src).toContain('logo-full.png');
    });

    it('renders the tagline text', () => {
      expect(screen.getByText(/India's smartest roadside assistance platform/i)).toBeInTheDocument();
    });
  });

  describe('Social Icons', () => {
    it('renders the Facebook icon with correct image', () => {
      const fbIcon = screen.getByAltText('Facebook') as HTMLImageElement;
      expect(fbIcon).toBeInTheDocument();
      expect(fbIcon.src).toContain('facebook.png');
    });

    it('renders the LinkedIn icon with correct image', () => {
      const liIcon = screen.getByAltText('LinkedIn') as HTMLImageElement;
      expect(liIcon).toBeInTheDocument();
      expect(liIcon.src).toContain('linkedin.png');
    });

    it('renders the WhatsApp icon with correct image', () => {
      const waIcon = screen.getByAltText('WhatsApp') as HTMLImageElement;
      expect(waIcon).toBeInTheDocument();
      expect(waIcon.src).toContain('whatsapp.png');
    });

    it('WhatsApp link points to the correct wa.me URL', () => {
      const waIcon = screen.getByAltText('WhatsApp');
      const link = waIcon.closest('a');
      expect(link).toHaveAttribute('href', 'https://wa.me/917340066655');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders the Instagram icon with correct link', () => {
      const instaLink = screen.getByLabelText('Instagram');
      expect(instaLink).toBeInTheDocument();
      expect(instaLink).toHaveAttribute('href', 'https://www.instagram.com/erinaassistance?igsh=dTFnMmh4NDJqcTRx');
      expect(instaLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Quick Links', () => {
    it('renders the Quick Links heading', () => {
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
    });

    it('has a link to the Home page', () => {
      const homeLinks = screen.getAllByText('Home');
      const footerHome = homeLinks.find(el => el.closest('footer'));
      expect(footerHome).toBeDefined();
    });

    it('has a link to About Us', () => {
      const links = screen.getAllByText('About Us');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('has a link to Membership Plans', () => {
      const links = screen.getAllByText('Membership Plans');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('has a link to Partner With Us', () => {
      const links = screen.getAllByText('Partner With Us');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('has a link to Contact Us', () => {
      const links = screen.getAllByText('Contact Us');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Services Links', () => {
    it('renders the Our Services heading', () => {
      expect(screen.getByText('Our Services')).toBeInTheDocument();
    });

    it('has Car Towing link', () => {
      expect(screen.getByText('Car Towing')).toBeInTheDocument();
    });

    it('has Bike Assistance link', () => {
      expect(screen.getByText('Bike Assistance')).toBeInTheDocument();
    });

    it('has Battery Jumpstart link', () => {
      expect(screen.getByText('Battery Jumpstart')).toBeInTheDocument();
    });

    it('has Fuel Delivery link', () => {
      expect(screen.getByText('Fuel Delivery')).toBeInTheDocument();
    });

    it('has EV Charging link', () => {
      expect(screen.getByText('EV Charging')).toBeInTheDocument();
    });
  });

  describe('Contact Info', () => {
    it('renders the Contact Info heading', () => {
      expect(screen.getByText('Operations Hub')).toBeInTheDocument();
    });

    it('displays the address', () => {
      expect(screen.getByText(/Dinnur Main Road, Kadugodi Colony/i)).toBeInTheDocument();
    });

    it('displays the phone number', () => {
      expect(screen.getAllByText('+91 73400 66655')[0]).toBeInTheDocument();
    });

    it('displays the email', () => {
      expect(screen.getByText('support@erinaassistance.in')).toBeInTheDocument();
    });
  });

  describe('Copyright & Legal', () => {
    it('displays copyright with current year', () => {
      const year = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    });

    it('has Privacy Policy link', () => {
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });

    it('has Terms of Service link', () => {
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });
  });
});
