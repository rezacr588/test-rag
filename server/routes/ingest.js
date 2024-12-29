import express from 'express';
import multer from 'multer';
import pdfParser from 'pdf-parse';
import { namedEntityRecognition, generateEmbeddings } from '../utils/nlp.js';
import { createIndex } from '../utils/vectorDatabase.js';
import { pc } from '../utils/pineconeClient.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * @swagger
 * /ingest:
 *   post:
 *     summary: Ingest a document
 *     description: Upload a PDF or text file for processing
 *     tags:
 *       - Ingestion
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document ingested successfully
 *       400:
 *         description: No file uploaded or unsupported file type
 *       500:
 *         description: Error ingesting document
 */

router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('Starting ingestion process...');
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    console.log(`Received file: ${req.file.originalname}, type: ${req.file.mimetype}`);
    
    let pages = [];
      
    
      
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParser(req.file.buffer);
        pages = pdfData.text.split(/\f/) || [];
        console.log(pages);
        
    } else if (req.file.mimetype === 'text/plain') {
      const textContent = req.file.buffer.toString('utf8');
        pages = [textContent];
        console.log(pages);
        
    } else {
      return res.status(400).send('Unsupported file type');
    }

    console.log('Performing named entity recognition on extracted pages...');
    const processedPages = pages.map((pageText) => namedEntityRecognition(pageText));
      
    console.log(processedPages);
      
    console.log('Ensuring the Pinecone index is created or exists...');
    await createIndex();

    const chunkText = (text) => {
      // Split text into paragraphs based on double newline characters
      return text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
    };
    
    console.log('Splitting text into paragraphs...');

    const MAX_ITEMS = 5;

    for (let i = 0; i < processedPages.length; i++) {
      const pageObj = processedPages[i];
      const chunkedTexts = chunkText(pageObj.text);
        console.log(chunkedTexts);
        
      for (let j = 0; j < chunkedTexts.length; j++) {
        const chunk = chunkedTexts[j];
        console.log('Generating embeddings for each paragraph...');
        const vector = await generateEmbeddings(chunk);
          console.log(vector);
          
          console.log(pageObj);
          
        
        const metadata = {
          people: pageObj.people.slice(0, MAX_ITEMS),
          places: pageObj.places.slice(0, MAX_ITEMS),
          organizations: pageObj.organizations.slice(0, MAX_ITEMS),
          nouns: pageObj.nouns.slice(0, MAX_ITEMS),
          verbs: pageObj.verbs.slice(0, MAX_ITEMS),
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          pageIndex: i,
          chunkIndex: j,
          text: chunk,
          uploadTimestamp: new Date().toISOString(),
        };

        console.log('Upserting vectors into Pinecone...');
        await pc.index(process.env.PINECONE_INDEX_ID).upsert([
          {
            id: `page_${Date.now()}_${i}_${j}`,
            values: vector,
            metadata
          }
        ]);
      }
    }

    console.log('Document ingestion completed successfully.');
    res.send('Document ingested successfully');
  } catch (error) {
    res.status(500).send('Error ingesting document');
  }
});

export const ingestRouter = router;
