# Authentication and Security

## Authentication Flow

The API uses JWT (JSON Web Tokens) for authentication with a refresh token mechanism:

```
┌─────────┐                                                  ┌─────────┐
│  Client │                                                  │  Server │
└────┬────┘                                                  └────┬────┘
     │                                                            │
     │  POST /api/auth/signin                                     │
     │  {email, password}                                         │
     │ ─────────────────────────────────────────────────────────> │
     │                                                            │
     │                                                            │ ─┐
     │                                                            │  │ Verify credentials
     │                                                            │ <┘
     │                                                            │
     │                                                            │ ─┐
     │                                                            │  │ Generate tokens
     │                                                            │ <┘
     │                                                            │
     │  200 OK                                                    │
     │  {accessToken, refreshToken, user}                         │
     │ <───────────────────────────────────────────────────────── │
     │                                                            │
     │  [Use accessToken for API requests]                        │
     │                                                            │
     │  GET /api/products                                         │
     │  Authorization: Bearer {accessToken}                       │
     │ ─────────────────────────────────────────────────────────> │
     │                                                            │
     │  200 OK                                                    │
     │  [Products data]                                           │
     │ <───────────────────────────────────────────────────────── │
     │                                                            │
     │  [When accessToken expires]                                │
     │                                                            │
     │  POST /api/auth/refresh                                    │
     │  {refreshToken}                                            │
     │ ─────────────────────────────────────────────────────────> │
     │                                                            │
     │                                                            │ ─┐
     │                                                            │  │ Verify refresh token
     │                                                            │ <┘
     │                                                            │
     │  200 OK                                                    │
     │  {accessToken, refreshToken}                               │
     │ <───────────────────────────────────────────────────────── │
     │                                                            │
```

## JWT Implementation

```typescript
// Token generation
export const signAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: "45m" });
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
};

// Token verification
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw error;
  }
};
```

## Password Security

Passwords are securely hashed using bcrypt:

```typescript
// Password hashing during user registration
export const registerUser = async (userData: RegisterUserDto) => {
  // Validate email uniqueness
  const existingUser = await userRepo.findOneBy({ email: userData.email });
  if (existingUser) {
    throw new Error("Email already in use");
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Create user with hashed password
  const user = userRepo.create({
    ...userData,
    password: hashedPassword
  });
  
  return await userRepo.save(user);
};

// Password verification during login
const isPasswordValid = await bcrypt.compare(password, userFound.password);
```

## Role-Based Access Control (RBAC)

The API implements role-based access control:

```typescript
// RBAC middleware
export function authRbac(role: "admin" | "seller" | "buyer") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ 
        error: `Forbidden. Only ${role}s can perform this operation` 
      });
    }
    next();
  };
}

// Usage in routes
router.get("/admin/orders", authenticate, authRbac("admin"), getAllOrders);
```

## Security Best Practices

1. **Password Storage**: Passwords are never stored in plain text, only bcrypt hashes
2. **Token Security**: 
   - Access tokens have short lifespan (45 minutes)
   - Refresh tokens have longer lifespan (7 days) but are stored in database
   - Tokens can be revoked server-side
3. **Data Protection**:
   - Sensitive fields like `password` are excluded from query results
   - Input validation prevents injection attacks
4. **API Security**:
   - CORS configuration limits cross-origin requests
   - Rate limiting prevents brute force attacks
   - Request validation ensures data integrity