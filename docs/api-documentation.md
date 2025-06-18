# API Documentation

## Swagger Integration

The API uses Swagger/OpenAPI for interactive documentation. The configuration is set up in `src/config/swagger.config.ts`:

```typescript
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Marketplace API",
      version: "1.0.0",
      description:
        "API documentation for the e-commerce marketplace application",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            category: { type: "string" },
            images: {
              type: "array",
              items: { type: "string" },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // Other schemas...
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000/api",
        description: "Development server",
      },
    ],
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./src/services/*.ts",
    "./src/docs/*.ts",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
```

## JSDoc Annotations

API endpoints are documented using JSDoc annotations in dedicated documentation files:

```typescript
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (public)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product title
 *       - in: query
 *         name: fuzzy
 *         schema:
 *           type: boolean
 *         description: Enable fuzzy search
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
```

## Schema Definitions

Reusable schema definitions are defined in the Swagger configuration:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, paid, shipped, fulfilled, cancelled]
 *         total:
 *           type: number
 *           format: float
 *         buyer:
 *           $ref: '#/components/schemas/User'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
```

## Accessing Documentation

The Swagger UI is available at `/docs` when the application is running:

```
http://localhost:5000/docs
```

This provides an interactive interface for exploring and testing API endpoints.

## Documentation Organization

Documentation is organized by module, with separate files for each major feature:

- `src/docs/auth.docs.ts`: Authentication endpoints
- `src/docs/products.docs.ts`: Product management endpoints
- `src/docs/cart.docs.ts`: Shopping cart endpoints
- `src/docs/order.docs.ts`: Order processing endpoints
- `src/docs/conversation.docs.ts`: Messaging endpoints
- `src/docs/message.docs.ts`: Message management endpoints

## Future Documentation Improvements

As noted in the tech debt document, several improvements are planned:

- Reusable Swagger schemas
- Global error response documentation
- Paginated response examples
- File size/type validation notes
- Cleaner UI layout of tags in Swagger