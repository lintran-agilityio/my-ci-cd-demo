import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: JestConfigWithTsJest = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.jest.json"
    }]
  },
  testTimeout: 10000,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!<rootDir>/node_modules/',
    '!<rootDir>/path/to/dir/',
    '!<rootDir>/src/config/',
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    '<rootDir>/src/config/',
    '<rootDir>/src/entities/',
    '<rootDir>/src/server.ts',
    '<rootDir>/src/apiDoc/swapper.ts',
    '<rootDir>/src/app.ts',
    '<rootDir>/src/db/**.*',
    '<rootDir>/src/logs/**.*',
  ],
};

export default config;
