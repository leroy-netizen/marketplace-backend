# Testing Strategy

## Testing Framework

The project uses Jest for unit and integration testing:

```typescript
// Example test for product service
import { createProduct, getProductById } from "../services/product.service";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { User } from "../entities/User";

describe("Product Service", () => {
  let testUser: User;
  let testProduct: Product;
  
  beforeAll(async () => {
    await AppDataSource.initialize();
    
    // Create test user
    testUser = AppDataSource.getRepository(User).create({
      name: "Test Seller",
      email: "test-seller@example.com",
      password: "hashedpassword",
      role: "seller"
    });
    
    await AppDataSource.getRepository(User).save(testUser);
  });
  
  afterAll(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Product).delete({ seller: { id: testUser.id } });
    await AppDataSource.getRepository(User).delete({ id: testUser.id });
    
    await AppDataSource.destroy();
  });
  
  it("should create a new product", async () => {
    const productData = {
      title: "Test Product",
      description: "Test description",
      price: 99.99,
      category: "Test Category"
    };
    
    testProduct = await createProduct(testUser.id, productData, []);
    
    expect(testProduct).toBeDefined();
    expect(testProduct.id).toBeDefined();
    expect(testProduct.title).toBe(productData.title);
    expect(testProduct.price).toBe(productData.price);
    expect(testProduct.seller.id).toBe(testUser.id);
  });
  
  it("should retrieve a product by ID", async () => {
    const product = await getProductById(testProduct.id);
    
    expect(product).toBeDefined();
    expect(product!.id).toBe(testProduct.id);
    expect(product!.title).toBe(testProduct.title);
  });
});
```

## Test Types

### Unit Tests

Unit tests focus on testing individual functions and components in isolation:

```typescript
// Unit test for JWT utility functions
describe("JWT Utilities", () => {
  const userId = "test-user-id";
  const userRole = "buyer";
  
  it("should generate a valid access token", () => {
    const token = signAccessToken(userId, userRole);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });
  
  it("should verify a valid token", () => {
    const token = signAccessToken(userId, userRole);
    const decoded = verifyToken(token) as any;
    
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(userId);
    expect(decoded.role).toBe(userRole);
  });
  
  it("should throw on invalid token", () => {
    expect(() => {
      verifyToken("invalid-token");
    }).toThrow();
  });
});
```

### Integration Tests

Integration tests verify the interaction between different parts of the application:

```typescript
// Integration test for authentication endpoints
describe("Authentication API", () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });
  
  afterAll(async () => {
    await AppDataSource.destroy();
  });
  
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "test-integration@example.com",
        password: "Password123!",
        role: "buyer"
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe("test-integration@example.com");
  });
  
  it("should login an existing user", async () => {
    const response = await request(app)
      .post("/api/auth/signin")
      .send({
        email: "test-integration@example.com",
        password: "Password123!"
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");
  });
});
```

### E2E Tests

End-to-end tests simulate real user scenarios across multiple API endpoints:

```typescript
// E2E test for order creation flow
describe("Order Creation Flow", () => {
  let buyerToken: string;
  let productId: string;
  
  beforeAll(async () => {
    // Setup test data and authenticate
    // ...
  });
  
  it("should add product to cart", async () => {
    const response = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        productId,
        quantity: 2
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.quantity).toBe(2);
  });
  
  it("should create an order from cart", async () => {
    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "Test Country"
        }
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.status).toBe("pending");
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].productId).toBe(productId);
  });
});
```

## Test Coverage

Jest is configured to generate coverage reports:

```json
// jest.config.js
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/migration/**",
    "!src/docs/**",
    "!src/types/**",
    "!src/main.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## Mocking

Tests use mocks to isolate components and avoid external dependencies:

```typescript
// Mocking database repositories
jest.mock("../config/database", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity === User) {
        return {
          findOneBy: jest.fn().mockResolvedValue({
            id: "mock-user-id",
            name: "Mock User",
            email: "mock@example.com",
            role: "buyer"
          }),
          create: jest.fn().mockImplementation((data) => data),
          save: jest.fn().mockImplementation((data) => ({
            id: "new-entity-id",
            ...data
          }))
        };
      }
      
      return {
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn()
      };
    })
  }
}));
```

## CI/CD Integration

Tests are integrated into the CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: marketplace_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/marketplace_test
          JWT_SECRET: test_jwt_secret
          JWT_REFRESH_SECRET: test_refresh_secret
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```