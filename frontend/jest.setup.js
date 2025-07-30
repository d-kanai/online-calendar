// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))