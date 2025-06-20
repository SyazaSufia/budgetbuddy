// Jest configuration specifically for Node.js backend tests
export default {
  displayName: 'Node.js Backend Tests',
  testEnvironment: 'node',
  
  // Setup files for Node.js tests
  setupFilesAfterEnv: ['<rootDir>/setuptest.node.js'],
  
  // Only run server-side tests
  testMatch: [
    '**/server/**/*.test.js',
    '**/server/**/__tests__/**/*.js'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.js$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs'
        }]
      ]
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'node'],
  
  // Collect coverage from server files only
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/**/*.test.js',
    '!server/node_modules/**'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage/server'
};