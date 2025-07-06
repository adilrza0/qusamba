import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'
import { usePathname } from 'next/navigation'

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

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

// Mock the contexts
jest.mock('@/contexts/cart-context', () => ({
  CartProvider: ({ children }) => <div>{children}</div>,
}))

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    state: { isAuthenticated: false, user: null },
    logout: jest.fn(),
  }),
}))

jest.mock('@/components/user-menu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/')
  })

  it('renders the Qusamba logo', () => {
    render(<Navbar />)
    
    const logo = screen.getByText('Qusamba')
    expect(logo).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Navbar />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('highlights the current page', () => {
    usePathname.mockReturnValue('/products')
    render(<Navbar />)
    
    const shopLink = screen.getByText('Shop').closest('a')
    expect(shopLink).toHaveClass('underline', 'text-primary')
  })

  it('renders cart and wishlist icons', () => {
    render(<Navbar />)
    
    const wishlistButton = screen.getByLabelText('Wishlist')
    const cartButton = screen.getByLabelText('Cart')
    
    expect(wishlistButton).toBeInTheDocument()
    expect(cartButton).toBeInTheDocument()
  })

  it('renders user menu', () => {
    render(<Navbar />)
    
    const userMenu = screen.getByTestId('user-menu')
    expect(userMenu).toBeInTheDocument()
  })
})
