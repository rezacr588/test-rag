import express from 'express';
import dotenv from 'dotenv';
import { ingestRouter } from './routes/ingest.js';
import { questionRouter } from './routes/question.js';
import { swaggerUi, specs } from './utils/swagger.js';
import { listRouter } from './routes/list.js';
import { createIndex } from './utils/vectorDatabase.js';
import { deleteRouter } from './routes/deleteAllDocuments.js';
dotenv.config();
const app = express();
const port = 3000;

createIndex().catch(console.error);

app.use(express.json());

app.use('/list', listRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/ingest', ingestRouter);
app.use('/question', questionRouter);
app.use("/clean", deleteRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});