import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the child components to isolate homepage layout testing
jest.mock('@/components/Home/HeroSection', () => {
  return function MockHeroSection() {
    return <div data-testid="hero-section">HeroSection</div>;
  };
});

jest.mock('@/components/Home/ServicesSection', () => {
  return function MockServicesSection() {
    return <div data-testid="services-section">ServicesSection</div>;
  };
});

jest.mock('@/components/Home/SuccessStoriesSection', () => {
  return function MockSuccessStoriesSection() {
    return <div data-testid="success-stories-section">SuccessStoriesSection</div>;
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the HeroSection component', () => {
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders the ServicesSection component', () => {
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
  });

  it('renders the SuccessStoriesSection component', () => {
    expect(screen.getByTestId('success-stories-section')).toBeInTheDocument();
  });

  it('renders sections in the correct order', () => {
    const hero = screen.getByTestId('hero-section');
    const services = screen.getByTestId('services-section');
    const stories = screen.getByTestId('success-stories-section');

    // Verify DOM order using compareDocumentPosition
    expect(hero.compareDocumentPosition(services)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(services.compareDocumentPosition(stories)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
