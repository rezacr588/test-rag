import express from 'express';
import { generateEmbeddings } from '../utils/nlp.js';
import { pc } from '../utils/pineconeClient.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * @swagger
 * /question:
 *   post:
 *     summary: Ask a question
 *     description: Get an answer based on ingested documents
 *     tags:
 *       - QnA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                 relevantChunks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                       confidence:
 *                         type: number
 *       400:
 *         description: No query provided
 *       500:
 *         description: Error processing query
 */

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).send('No query provided');
    }

    const queryVec = await generateEmbeddings(query);
    const { matches } = await pc.index('qa-index').query({ vector: queryVec, topK: 3, includeMetadata: true });

    const context = matches
      .map(match => match.metadata?.text)
      .filter(Boolean)
      .join('\n\n');

    const relevantChunks = matches.map(match => ({
      text: match.metadata?.text,
      confidence: match.score
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that uses provided context to answer user questions accurately. You will not mention that I am providing the information from the context and act like already knows the context and giving the answer by using that' },
        { role: 'user', content: `Context:\n${context}\n\nUser Question: ${query}` }
      ],
      temperature: 0.7
    });

    const finalAnswer = completion.choices[0]?.message?.content?.trim() || '';
    res.json({
      answer: finalAnswer,
      relevantChunks
    });
  } catch {
    res.status(500).send('Error processing query');
  }
});

export const questionRouter = router;