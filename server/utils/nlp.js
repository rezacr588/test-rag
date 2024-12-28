import nlp from 'compromise';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Performs basic Named Entity Recognition (NER) on the given text
 * using the 'compromise' library
 */
export function namedEntityRecognition(text) {
  const doc = nlp(text);
  return {
    people: doc.people().out('array'),
    places: doc.places().out('array'),
    organizations: doc.organizations().out('array'),
    values: doc.values().out('array'),
    topics: doc.topics().out('array'),
    nouns: doc.nouns().out('array'),
    verbs: doc.verbs().out('array'),
    adjectives: doc.adjectives().out('array'),
    text
  };
}

/**
 * Generates embeddings for the provided text using OpenAI's
 * text-embedding-ada-002 model.
 */
export async function generateEmbeddings(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}
