import dotenv from 'dotenv';
import { pc } from './pineconeClient.js';

dotenv.config();

const indexName = 'qa-index';

export const createIndex = async () => {
  try {
      const existingIndexes = (await pc.listIndexes()).indexes;      
    if (Array.isArray(existingIndexes)) {
      const indexes = existingIndexes.map(index => index.name);
      if (!indexes.includes(indexName)) {
        console.log('Creating new Pinecone index...');
        await pc.createIndex({
          name: indexName,
          dimension: 1536,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        console.log('Index created successfully');
      }
    } else {
      console.error('Error: existingIndexes is not an array');
    }
  } catch (error) {
    console.error('Error creating/checking index:', error);
    throw error;
  }
};