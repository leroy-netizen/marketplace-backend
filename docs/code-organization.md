# Code Organization and Patterns

## Directory Structure

The codebase follows a feature-based organization with clear separation of concerns:

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── docs/             # API documentation
├── entities/         # Database models
├── middlewares/      # Express middlewares
├── migration/        # Database migrations
├── routes/           # API routes
├── services/         # Business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── main.ts           # Application entry point
```

## Design Patterns

### Repository Pattern

TypeORM implements the repository pattern, providing a clean abstraction over database operations:

```typescript
// Example: Product repository usage
const productRepo = AppDataSource.getRepository(Product);

// Finding products with filtering
const products = await productRepo.find({
  where: {
    price: Between(minPrice, maxPrice),
    category: Equal(category)
  },
  order: {
    createdAt: "DESC"
  },
  take: limit,
  skip: (page - 1) * limit
});
```

### Service Layer Pattern

Business logic is encapsulated in service modules:

```typescript
// Example: Product service
export const createProduct = async (
  sellerId: string,
  productData: CreateProductDto,
  imageFiles: Express.Multer.File[]
) => {
  // Validate seller
  const seller = await userRepo.findOneBy({ id: sellerId, role: "seller" });
  if (!seller) throw new Error("Seller not found");
  
  // Process images
  const imagePaths = await processProductImages(imageFiles);
  
  // Create product
  const product = productRepo.create({
    ...productData,
    seller,
    images: imagePaths
  });
  
  return await productRepo.save(product);
};
```

### Middleware Pattern

Express middleware for cross-cutting concerns:

```typescript
// Authentication middleware
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

## TypeScript Usage

### Type Definitions

Custom types enhance code readability and maintainability:

```typescript
// Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Product creation DTO
export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
}
```

### Entity Relationships

TypeORM decorators define entity relationships:

```typescript
@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  
  @ManyToOne(() => User, user => user.orders)
  buyer!: User;
  
  @OneToMany(() => OrderItem, item => item.order, {
    cascade: true,
    eager: true
  })
  items!: OrderItem[];
  
  @Column({
    type: "enum",
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending"
  })
  status!: string;
  
  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
}
```