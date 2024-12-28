import express from 'express';
import { pc } from '../utils/pineconeClient.js';

const router = express.Router();

/**
 * @swagger
 * /list:
 *   get:
 *     summary: List ingested documents
 *     description: Retrieves all documents from the qa-index
 *     tags:
 *       - Ingestion
 *       - Documents
 *     responses:
 *       200:
 *         description: List of ingested documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Error retrieving documents
 */
router.get('/', async (req, res) => {
  try {
    console.log('Fetching documents from Pinecone index');
    const index = pc.index('qa-index');
    const queryResponse = await index.query({
      vector: Array(1536).fill(0), // Zero vector to match all
      topK: 10000,
      includeMetadata: true
    });

    console.log('Query response:', queryResponse);

    res.json({ documents: queryResponse.matches });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send('Error retrieving documents');
  }
});

export const listRouter = router;