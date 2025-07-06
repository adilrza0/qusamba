import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2', 'text-white')
    expect(result).toBe('px-4 py-2 text-white')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('handles falsy conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class')
  })

  it('merges conflicting Tailwind classes correctly', () => {
    const result = cn('px-4', 'px-6') // px-6 should override px-4
    expect(result).toBe('px-6')
  })

  it('handles arrays of classes', () => {
    const result = cn(['px-4', 'py-2'], 'text-white')
    expect(result).toBe('px-4 py-2 text-white')
  })

  it('handles empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })
})
