/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order successfully created
 *       400:
 *         description: Bad Request (e.g., empty cart)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the authenticated buyer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of buyer's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /seller/orders:
 *   get:
 *     summary: Get all orders that contain the seller's products
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of order items for the seller
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderItem'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /order-items/{id}/status:
 *   patch:
 *     summary: Update the status of a specific order item
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newStatus:
 *                 type: string
 *                 enum: [shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order item not found
 *       500:
 *         description: Internal server error
 *       503:
 *         description: Service unavailable
 *       429:
 *         description: Too many requests
 *       502:
 *         description: Bad gateway
 */

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
 *         total:
 *           type: number
 *         createdAt:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         quantity:
 *           type: number
 *         unitPrice:
 *           type: number
 *         status:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/Product'
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           description: The category of the product
 *         stock:
 *           type: number
 *           description: The available stock of the product
 *         supplier:
 *           type: string
 *           description: The supplier of the product
 *         sku:
 *           type: string
 *           description: The stock keeping unit of the product
 *         warranty:
 *           type: string
 *           description: The warranty information for the product
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Retrieve all orders (Admin only)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, shipped, fulfilled, cancelled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/orders/{orderId}:
 *   get:
 *     summary: Retrieve order details (Admin only)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newStatus
 *             properties:
 *               newStatus:
 *                 type: string
 *                 enum: [pending, paid, shipped, fulfilled, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */

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
 *         shippingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed]
 */