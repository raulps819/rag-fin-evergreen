# Testing Guide

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run tests with coverage
```bash
pnpm test:coverage
```

## Test Structure

```
test/
├── unit/
│   └── services/
│       ├── ChunkingService.test.ts
│       └── IndexingService.test.ts
└── README.md
```

## Unit Tests

### ChunkingService Tests

Tests for text chunking functionality:
- ✅ Empty text handling
- ✅ Small text (single chunk)
- ✅ Large text splitting
- ✅ Chunk overlap verification
- ✅ Sentence boundary preservation
- ✅ Paragraph-preserving mode
- ✅ Chunk index assignment
- ✅ Chunk size limits

**Run specific test:**
```bash
pnpm test ChunkingService
```

### IndexingService Tests

Tests for document indexing pipeline:
- ✅ Successful document indexing
- ✅ Parser not found handling
- ✅ Empty chunks handling
- ✅ Parsing error handling
- ✅ Embedding generation error handling
- ✅ Document reindexing
- ✅ Document removal
- ✅ Batch indexing

**Run specific test:**
```bash
pnpm test IndexingService
```

## Writing New Tests

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  describe('myMethod', () => {
    it('should do something', () => {
      const result = service.myMethod();
      expect(result).toBe(expected);
    });
  });
});
```

### Mocking Dependencies

```typescript
const mockDependency = {
  method: vi.fn(),
};

const service = new MyService(mockDependency as any);

// Setup mock behavior
mockDependency.method.mockReturnValue('value');
mockDependency.method.mockResolvedValue(Promise.resolve('value'));
mockDependency.method.mockRejectedValue(new Error('error'));

// Verify calls
expect(mockDependency.method).toHaveBeenCalledWith(args);
expect(mockDependency.method).toHaveBeenCalledTimes(1);
```

## Coverage Reports

After running `pnpm test:coverage`, coverage reports are generated in:
- `coverage/index.html` - HTML coverage report
- `coverage/coverage-final.json` - JSON coverage data

Open the HTML report in your browser:
```bash
open coverage/index.html
```

## CI/CD Integration

Tests should be run in CI/CD pipeline before deployment:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: pnpm test

- name: Generate coverage
  run: pnpm test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```