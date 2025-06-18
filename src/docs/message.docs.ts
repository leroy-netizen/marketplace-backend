/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: API endpoints for managing messages within conversations
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a new message
 *     description: Creates a new message in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - content
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request or empty message
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /messages/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     description: Retrieves all messages for a specific conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /messages/{messageId}/user:
 *   delete:
 *     summary: Delete message for current user only
 *     description: Marks a message as deleted for the current user only
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted for user
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /messages/{messageId}/everyone:
 *   delete:
 *     summary: Delete message for everyone
 *     description: Marks a message as deleted for everyone (sender only)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted for everyone
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - Only sender can delete for everyone
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /messages/{messageId}/read:
 *   patch:
 *     summary: Mark message as read
 *     description: Updates a message to mark it as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to mark as read
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique message ID
 *         conversation:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
 *           description: Message content
 *         isRead:
 *           type: boolean
 *           description: Whether the message has been read
 *         deletedForEveryone:
 *           type: boolean
 *           description: Whether the message is deleted for everyone
 *         deletedForUsers:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of users who deleted this message
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
