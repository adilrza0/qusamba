import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/hero-section'

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

jest.mock('next/image', () => {
  return function MockImage(props) {
    return <img {...props} />
  }
})

describe('HeroSection Component', () => {
  it('renders the main heading', () => {
    render(<HeroSection />)
    
    const heading = screen.getByRole('heading', { 
      name: /elegant bangles for every occasion/i 
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<HeroSection />)
    
    const description = screen.getByText(/discover our handcrafted collection/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the shop collection button', () => {
    render(<HeroSection />)
    
    const shopButton = screen.getByRole('link', { name: /shop collection/i })
    expect(shopButton).toBeInTheDocument()
    expect(shopButton).toHaveAttribute('href', '/products')
  })

  it('renders the learn more button', () => {
    render(<HeroSection />)
    
    const learnMoreButton = screen.getByRole('link', { name: /learn more/i })
    expect(learnMoreButton).toBeInTheDocument()
    expect(learnMoreButton).toHaveAttribute('href', '/about')
  })

  it('renders the hero image', () => {
    render(<HeroSection />)
    
    const image = screen.getByAltText(/elegant bangles collection/i)
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/download.jpeg')
  })

  it('has correct styling classes for responsiveness', () => {
    render(<HeroSection />)
    
    // Query by tag name since section doesn't have a default role
    const section = document.querySelector('section')
    expect(section).toHaveClass('w-full', 'py-12', 'md:py-24', 'lg:py-32')
  })
})
