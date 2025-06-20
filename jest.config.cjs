export default {
  // Test environment configuration
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setuptest.js'],
  
  // Transform configuration for mixed ES modules and CommonJS
  transform: {
    '^.+\\.jsx?$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs' // Transform ES modules to CommonJS for Jest
        }],
        '@babel/preset-react'
      ]
    }]
  },
  
  // File extensions to consider
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Module name mapping for CSS and other assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': 'identity-obj-proxy'
  },
  
  // Globals configuration
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Collect coverage from these files
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/**/*.test.js',
    '!server/node_modules/**',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};