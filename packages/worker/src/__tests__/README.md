# Test Suite Documentation

This directory contains comprehensive tests for the Dartmouth Agent Army system.

## 📁 Test Structure

```
__tests__/
├── integration/           # Integration tests
│   └── conversation-flow.test.ts
├── components/           # Component unit tests
│   └── IntentDetector.test.ts
├── handlers/            # Handler unit tests
│   ├── GreetingHandler.test.ts
│   └── CalculationHandler.test.ts
├── services/            # Service unit tests
│   └── LLMService.test.ts
└── README.md           # This file
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npx vitest run src/__tests__/handlers/GreetingHandler.test.ts
```

### Run Tests Matching Pattern
```bash
npx vitest run -t "greeting"
```

## 📊 Test Coverage

Our goal is to maintain >80% code coverage across all modules.

**Current Coverage Areas:**
- ✅ Handlers (7 handlers)
- ✅ Components (IntentDetector, etc.)
- ✅ Services (LLMService)
- ✅ Integration (Full conversation flows)

## 🧪 Test Categories

### Unit Tests
Test individual components in isolation.

**Examples:**
- `GreetingHandler.test.ts` - Tests greeting handler logic
- `CalculationHandler.test.ts` - Tests calculation handler
- `IntentDetector.test.ts` - Tests intent detection
- `LLMService.test.ts` - Tests LLM service functionality

### Integration Tests
Test complete workflows and component interactions.

**Examples:**
- `conversation-flow.test.ts` - Tests full conversation flows
  - Greeting flows
  - Multi-turn conversations
  - Intent switching
  - Session management
  - Error handling

## ✅ Test Checklist

### Handler Tests
Each handler should test:
- [ ] `canHandle()` - Intent matching
- [ ] `handle()` - Response generation
- [ ] Metadata inclusion
- [ ] Edge cases (empty input, long input, special characters)
- [ ] Error handling

### Component Tests
Each component should test:
- [ ] Core functionality
- [ ] Input validation
- [ ] Output format
- [ ] Edge cases
- [ ] Performance

### Integration Tests
Should cover:
- [ ] Full conversation flows
- [ ] Multi-turn conversations
- [ ] State management
- [ ] Session isolation
- [ ] Error recovery
- [ ] Performance benchmarks

## 📝 Writing Tests

### Test Template
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ComponentName', () => {
  let component: ComponentType;

  beforeEach(() => {
    component = new ComponentType();
  });

  describe('method name', () => {
    it('should do something', () => {
      const result = component.method();
      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle edge case', () => {
      // Test edge case
    });
  });
});
```

### Best Practices

1. **Descriptive Test Names**
   - ✅ `should detect greeting intent for "hello"`
   - ❌ `test1`

2. **Arrange-Act-Assert Pattern**
   ```typescript
   // Arrange
   const input = 'test input';
   
   // Act
   const result = component.process(input);
   
   // Assert
   expect(result).toBe('expected output');
   ```

3. **Test One Thing**
   - Each test should verify one specific behavior
   - Keep tests focused and simple

4. **Use beforeEach for Setup**
   - Initialize common test data in `beforeEach`
   - Ensures clean state for each test

5. **Test Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Very large inputs
   - Special characters
   - Unicode/emojis

6. **Mock External Dependencies**
   - Use mocks for database calls
   - Mock LLM API calls
   - Mock external services

## 🎯 Test Scenarios

### Greeting Handler
- Simple greetings (hello, hi, hey)
- Time-based greetings (good morning)
- Case insensitivity
- First-time vs returning users
- Special characters and emojis

### Calculation Handler
- Basic calculations
- Different DPI values
- Quality assessments
- Multiple print sizes
- Invalid inputs
- Edge cases (zero, negative, huge numbers)

### Intent Detector
- All intent types (greeting, farewell, calculation, etc.)
- Confidence scoring
- Entity extraction
- Context awareness
- Ambiguous messages

### LLM Service
- Token estimation
- Cost calculation
- Multiple providers
- Error handling
- Configuration validation

### Integration Tests
- Complete conversation flows
- Multi-turn conversations
- Intent switching
- Session management
- State persistence
- Error recovery
- Performance benchmarks

## 🐛 Debugging Tests

### Run Single Test
```bash
npx vitest run -t "specific test name"
```

### Enable Debug Output
```typescript
it('should debug', () => {
  console.log('Debug info:', data);
  expect(data).toBeDefined();
});
```

### Use Vitest UI
```bash
npx vitest --ui
```

## 📈 Coverage Reports

After running `npm run test:coverage`, view the HTML report:

```bash
# Open coverage/index.html in your browser
```

**Coverage Goals:**
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## 🔧 Troubleshooting

### Tests Failing
1. Check if dependencies are installed: `npm install`
2. Verify TypeScript compiles: `npm run lint`
3. Check for syntax errors in test files
4. Ensure mocks are properly configured

### Slow Tests
1. Use `it.only()` to run specific tests
2. Check for unnecessary async operations
3. Mock expensive operations
4. Use `beforeEach` efficiently

### Coverage Issues
1. Ensure all files are included in coverage
2. Check `vitest.config.ts` exclusions
3. Add tests for uncovered branches
4. Test error paths and edge cases

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 🎓 Test Philosophy

**"Move Forward, Never Backward"**

Our tests ensure:
1. **Correctness** - Code works as intended
2. **Reliability** - No regressions
3. **Confidence** - Safe to refactor
4. **Documentation** - Tests explain behavior
5. **Quality** - High standards maintained

Every feature should have tests before deployment!

