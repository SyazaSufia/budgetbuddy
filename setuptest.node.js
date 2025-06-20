// Setup file specifically for Node.js backend tests
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder/TextDecoder polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Set up any Node.js specific test environment variables
process.env.NODE_ENV = 'test';

// Mock any environment variables your tests might need
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';