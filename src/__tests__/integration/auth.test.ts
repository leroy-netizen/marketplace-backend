import request from "supertest";
import app from "../../main";

// Mock the database connection
jest.mock("../../config/db.config", () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue({}),
    getRepository: jest.fn().mockImplementation(() => ({
      findOneBy: jest.fn().mockImplementation(({ email }) => {
        if (email === "existing@example.com") {
          return {
            id: "user-123",
            email: "existing@example.com",
            name: "Existing User",
            password:
              "$2b$10$X/XZFKxEkQzL9DULlKSYXO5CLS.xZGzb7pT5.QJjUHQFPe4hPjlIe", // hashed 'password123'
            role: "buyer",
          };
        }
        return null;
      }),
      create: jest.fn().mockImplementation((userData) => userData),
      save: jest.fn().mockImplementation((user) => ({
        id: "new-user-456",
        ...user,
        password: "hashed-password", // Simulate password hashing
      })),
    })),
  },
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
  compare: jest
    .fn()
    .mockImplementation((password, hash) => password === "password123"),
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockImplementation(() => "mock-jwt-token"),
}));

describe("Authentication API", () => {
  describe("POST /api/auth/signup", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        role: "buyer",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        // Missing email
        password: "Password123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/signin", () => {
    it("should login an existing user", async () => {
      const response = await request(app).post("/api/auth/signin").send({
        email: "existing@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/api/auth/signin").send({
        email: "existing@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should reject non-existent user", async () => {
      const response = await request(app).post("/api/auth/signin").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });
  });
});
