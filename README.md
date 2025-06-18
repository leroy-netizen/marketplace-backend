# Marketplace API

A robust e-commerce marketplace API built with Node.js, Express, TypeScript, and PostgreSQL. This API supports user authentication, product management, shopping cart functionality, order processing, and real-time messaging between buyers and sellers.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
  - [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Core Modules](#core-modules)
  - [Authentication](#authentication)
  - [Products](#products)
  - [Shopping Cart](#shopping-cart)
  - [Orders](#orders)
  - [Messaging](#messaging)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register, login, password reset, and token refresh
- **Role-Based Access Control**: Different permissions for buyers, sellers, and admins
- **Product Management**: Create, update, delete, and search products
- **Shopping Cart**: Add, update, remove items, and process checkout
- **Order Processing**: Create orders, update status, and view order history
- **Real-time Messaging**: Chat between buyers and sellers
- **Admin Dashboard**: Manage users, products, and orders
- **API Documentation**: Swagger UI for easy API exploration
- **Caching**: Redis-based caching for improved performance
- **Logging**: Comprehensive logging for debugging and monitoring

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL, TypeORM
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston
- **Search**: Fuse.js for fuzzy searching
- **Containerization**: Docker, Docker Compose

## Project Structure

```
marketplace-api/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── docs/             # API documentation
│   ├── entities/         # Database models
│   ├── middlewares/      # Express middlewares
│   ├── migration/        # Database migrations
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── main.ts           # Application entry point
├── uploads/              # Uploaded files storage
├── .env.example          # Example environment variables
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Redis
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/marketplace-api.git
   cd marketplace-api
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with pnpm
   pnpm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration.

### Environment Variables

```
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/marketplace
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=marketplace

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

API_URL=http://localhost:5000/api
RUNNING_ENV=dev
```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or with pnpm
   pnpm run dev
   ```

2. Build for production:
   ```bash
   npm run build
   # or with pnpm
   pnpm run build
   ```

3. Start in production mode:
   ```bash
   npm start
   # or with pnpm
   pnpm start
   ```

### Docker Setup

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. Stop the containers:
   ```bash
   docker-compose down
   ```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:5000/docs
```

## Core Modules

### Authentication

The authentication module handles user registration, login, and password management.

**Key Features:**
- User registration with role selection (buyer/seller/admin)
- Login with JWT token generation
- Password reset via email OTP
- Token refresh mechanism
- Role-based access control

**API Endpoints:**
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Login an existing user
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password with OTP
- `POST /api/auth/refresh`: Refresh access token

### Products

The products module manages the marketplace inventory.

**Key Features:**
- Product creation and management for sellers
- Product search with filtering and sorting
- Fuzzy search capabilities
- Image upload and management
- Category-based organization

**API Endpoints:**
- `POST /api/products`: Create a new product (sellers only)
- `GET /api/products`: List all products with filtering
- `GET /api/products/:id`: Get product details
- `PUT /api/products/:id`: Update a product (seller only)
- `DELETE /api/products/:id`: Delete a product (seller only)
- `GET /api/products/seller`: Get current seller's products
- `GET /api/products/seller/:sellerId`: Get products by seller ID

### Shopping Cart

The shopping cart module handles the user's shopping experience.

**Key Features:**
- Add products to cart
- Update quantities
- Remove items
- Calculate totals
- Prepare for checkout

**API Endpoints:**
- `GET /api/cart`: Get current user's cart
- `POST /api/cart`: Add item to cart
- `PUT /api/cart/:id`: Update cart item quantity
- `DELETE /api/cart/:id`: Remove item from cart
- `DELETE /api/cart`: Clear entire cart

### Orders

The orders module manages the purchasing process.

**Key Features:**
- Order creation from cart
- Order history for buyers
- Order management for sellers
- Status updates
- Admin order overview

**API Endpoints:**
- `POST /api/orders`: Create a new order
- `GET /api/orders`: Get user's orders
- `GET /api/orders/:id`: Get order details
- `PATCH /api/orders/:id/status`: Update order status (seller/admin)
- `GET /api/admin/orders`: Get all orders (admin only)

### Messaging

The messaging module enables communication between buyers and sellers.

**Key Features:**
- Conversation creation between users
- Message sending and receiving
- Message read status
- Message deletion (for self or everyone)
- Conversation management

**API Endpoints:**
- `POST /api/conversations`: Start or retrieve a conversation
- `GET /api/conversations`: Get user's conversations
- `POST /api/messages`: Send a message
- `GET /api/messages/:conversationId`: Get conversation messages
- `DELETE /api/messages/:messageId/user`: Delete message for current user
- `DELETE /api/messages/:messageId/everyone`: Delete message for everyone
- `PATCH /api/messages/:messageId/read`: Mark message as read

## Database Schema

The application uses the following main entities:

- **User**: Stores user information and authentication details
- **Product**: Represents items for sale in the marketplace
- **CartItem**: Links users to products in their shopping cart
- **Order**: Represents a completed purchase
- **OrderItem**: Links orders to purchased products
- **RefreshToken**: Stores refresh tokens for authentication
- **Conversation**: Represents a chat between two users
- **Message**: Stores individual messages within conversations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.