// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings in test environment
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    // Suppress Radix UI Dialog warnings about missing Description
    if (args[0]?.includes?.('Missing `Description` or `aria-describedby`')) {
      return
    }
    originalWarn(...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})