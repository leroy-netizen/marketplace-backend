/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: API endpoints for managing conversations
 */

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Start or retrieve a conversation
 *     description: Creates a new conversation or returns an existing one between two users
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: ID of the user to start conversation with
 *     responses:
 *       200:
 *         description: Conversation retrieved or created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Invalid request or cannot start conversation with yourself
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 *
 *   get:
 *     summary: Get all user conversations
 *     description: Retrieves all conversations for the authenticated user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique conversation ID
 *         participantOne:
 *           $ref: '#/components/schemas/User'
 *         participantTwo:
 *           $ref: '#/components/schemas/User'
 *         lastMessagePreview:
 *           type: string
 *           description: Preview of the last message in conversation
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */