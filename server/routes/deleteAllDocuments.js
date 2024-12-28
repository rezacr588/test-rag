import express from 'express';
import { pc } from '../utils/pineconeClient.js';
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config();

/**
 * @swagger
 * /clean:
 *   delete:
 *     summary: Delete all documents
 *     tags: 
 *       - Ingestion
 *     responses:
 *       200:
 *         description: All documents deleted from the index
 *       500:
 *         description: Error deleting documents
 */
router.delete('/', async (req, res) => {
    try {
        console.log('Deleting all documents from Pinecone index');
        await pc.delete_index(process.env.PINECONE_INDEX_ID);
        console.log('All documents deleted');
        return res.send('All documents deleted');
    } catch (error) {
        console.error('Error deleting all documents:', error);
        res.status(500).send('Error deleting documents');
    }
});

export const deleteRouter = router;