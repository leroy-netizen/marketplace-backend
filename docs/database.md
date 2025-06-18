# Database Design and ORM Usage

## Entity Relationship Diagram

```
┌───────────┐       ┌───────────┐       ┌───────────┐
│   User    │       │  Product  │       │ CartItem  │
├───────────┤       ├───────────┤       ├───────────┤
│ id        │       │ id        │       │ id        │
│ name      │       │ title     │       │ quantity  │
│ email     │◄──┐   │ price     │   ┌──►│ productId │
│ password  │   │   │ description│   │   │ userId   │
│ role      │   │   │ category  │   │   └───────────┘
└───────────┘   │   │ images    │   │
                │   │ sellerId  │◄──┘   ┌───────────┐
                │   └───────────┘       │   Order   │
                │                       ├───────────┤
                │   ┌───────────┐       │ id        │
                │   │ OrderItem │       │ status    │
                │   ├───────────┤       │ total     │
                └──►│ orderId   │◄──┐   │ buyerId   │◄─┐
                    │ productId │   │   └───────────┘  │
                    │ quantity  │   │                  │
                    │ unitPrice │   └──────────────────┘
                    └───────────┘
                    
┌───────────┐       ┌───────────┐
│Conversation│       │  Message  │
├───────────┤       ├───────────┤
│ id        │       │ id        │
│ partOneId │◄──┐   │ content   │
│ partTwoId │   │   │ isRead    │
└───────────┘   │   │ senderId  │
                │   │ convoId   │
                └──►└───────────┘
```

## TypeORM Configuration

```typescript
// Database configuration
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "marketplace",
  migrations: [path.join(__dirname, "../migration/*{.ts,.js}")],
  synchronize: process.env.RUNNING_ENV === "dev",
  logging: true,
  entities: [
    User, Product, RefreshToken, CartItem, 
    Order, OrderItem, Conversation, Message
  ],
});
```

## Entity Definitions

### User Entity

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Length(2)
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: "varchar", default: "buyer" })
  role!: UserRole;

  @Column({ default: false })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
  
  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems!: CartItem[];

  @OneToMany(() => Product, (product) => product.seller)
  products!: Product[];
  
  @OneToMany(() => RefreshToken, (token) => token.user, {
    cascade: true,
  })
  refreshTokens!: RefreshToken[];
  
  @OneToMany(() => Order, (order) => order.buyer)
  orders!: Order[];
}
```

## Database Migrations

```typescript
// Example migration
export class CreateProductTable1698765432 implements MigrationInterface {
    name = 'CreateProductTable1698765432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "category" character varying NOT NULL,
                "images" text array NOT NULL DEFAULT '{}',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "sellerId" uuid,
                CONSTRAINT "PK_product_id" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "product" 
            ADD CONSTRAINT "FK_product_seller" 
            FOREIGN KEY ("sellerId") REFERENCES "user"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_seller"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }
}
```

## Query Patterns

### Basic CRUD Operations

```typescript
// Create
const product = productRepo.create({
  title: "New Product",
  price: 99.99,
  description: "Product description",
  category: "Electronics",
  seller: user
});
await productRepo.save(product);

// Read
const product = await productRepo.findOneBy({ id: productId });

// Update
product.price = 89.99;
await productRepo.save(product);

// Delete
await productRepo.delete(productId);
```

### Complex Queries

```typescript
// Products with filtering, sorting and pagination
const products = await productRepo.find({
  where: [
    { 
      title: Like(`%${search}%`),
      price: Between(minPrice, maxPrice),
      category: Equal(category)
    }
  ],
  order: { [sortBy]: sortOrder },
  take: limit,
  skip: (page - 1) * limit,
  relations: ["seller"]
});

// Aggregation
const { sum, avg, count } = await productRepo
  .createQueryBuilder("product")
  .select("SUM(product.price)", "sum")
  .addSelect("AVG(product.price)", "avg")
  .addSelect("COUNT(product.id)", "count")
  .where("product.category = :category", { category })
  .getRawOne();

// Joining multiple entities
const ordersWithDetails = await orderRepo
  .createQueryBuilder("order")
  .leftJoinAndSelect("order.items", "orderItem")
  .leftJoinAndSelect("orderItem.product", "product")
  .leftJoinAndSelect("order.buyer", "user")
  .where("order.status = :status", { status: "delivered" })
  .andWhere("order.createdAt >= :date", { date: startDate })
  .orderBy("order.createdAt", "DESC")
  .getMany();

// Transaction example
await AppDataSource.transaction(async (transactionalEntityManager) => {
  // Create order
  const order = transactionalEntityManager.create(Order, {
    buyer: user,
    total: cartTotal,
    status: "pending"
  });
  
  await transactionalEntityManager.save(order);
  
  // Create order items
  const orderItems = cartItems.map(item => 
    transactionalEntityManager.create(OrderItem, {
      order,
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.product.price
    })
  );
  
  await transactionalEntityManager.save(orderItems);
  
  // Clear cart
  await transactionalEntityManager.delete(CartItem, { user: { id: userId } });
});
```

## Performance Optimization

### Indexing Strategy

TypeORM automatically creates indexes for primary keys and foreign keys, but additional indexes can improve query performance:

```typescript
@Entity()
export class Product {
  // Primary key (automatically indexed)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Index for text search
  @Index()
  @Column()
  title!: string;

  // Composite index for filtering
  @Index()
  @Column()
  category!: string;

  // Index for sorting
  @Index()
  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;
  
  // Other fields...
}
```

### Eager vs. Lazy Loading

TypeORM supports both eager and lazy loading of relationships:

```typescript
// Eager loading (always loads the relationship)
@OneToMany(() => OrderItem, item => item.order, { eager: true })
items!: OrderItem[];

// Lazy loading (loads on demand)
@ManyToOne(() => User, user => user.orders)
buyer!: User;

// Explicit loading when needed
const orderWithBuyer = await orderRepo.findOne({
  where: { id: orderId },
  relations: ["buyer"]
});
```

## Database Migration Workflow

The project uses TypeORM migrations to manage database schema changes:

1. **Create Migration**: Generate a migration based on entity changes
   ```bash
   pnpm run migration:generate -- -n CreateProductTable
   ```

2. **Run Migration**: Apply pending migrations to the database
   ```bash
   pnpm run migration:run
   ```

3. **Revert Migration**: Roll back the most recent migration
   ```bash
   pnpm run migrations:revert
   ```

4. **View Migration Status**: See which migrations have been applied
   ```bash
   pnpm run migration:show
   ```

## Data Validation

Entity validation is handled using class-validator decorators:

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Length(3, 100, { message: "Title must be between 3 and 100 characters" })
  title!: string;

  @Column("text")
  @Length(10, 2000, { message: "Description must be between 10 and 2000 characters" })
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @Min(0.01, { message: "Price must be greater than 0" })
  price!: number;

  @Column()
  @IsNotEmpty({ message: "Category is required" })
  category!: string;
  
  // Other fields...
}
```

## Soft Deletes

TypeORM supports soft deletes to maintain data history:

```typescript
@Entity()
export class Message {
  // Fields...
  
  @DeleteDateColumn()
  deletedAt?: Date;
}

// Soft delete a message
await messageRepo.softDelete(messageId);

// Find only non-deleted messages
const messages = await messageRepo.find({
  where: { conversation: { id: conversationId } }
});

// Include soft-deleted messages
const allMessages = await messageRepo.find({
  where: { conversation: { id: conversationId } },
  withDeleted: true
});
```

## Database Seeding

For development and testing, the application includes database seeders:

```typescript
// Example seeder for product categories
export const seedCategories = async () => {
  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Books",
    "Toys & Games"
  ];
  
  for (const name of categories) {
    const exists = await categoryRepo.findOneBy({ name });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create({ name }));
    }
  }
  
  console.log("Categories seeded successfully");
};

// Run all seeders
export const runSeeders = async () => {
  await seedUsers();
  await seedCategories();
  await seedProducts();
  console.log("Database seeded successfully");
};
```
