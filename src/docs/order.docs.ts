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
