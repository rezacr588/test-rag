# QA API

This project is a QA (Question Answering) API that allows users to ingest documents and ask questions based on the ingested content. It uses Pinecone for vector database management and OpenAI for generating embeddings and answering questions.

## Project Structure

```
.DS_Store
.env
eslint.config.js
index.js
package.json
readme.md
routes/
	deleteAllDocuments.js
	ingest.js
	list.js
	question.js
test/
	.DS_Store
	data/
		05-versions-space.pdf.txt
utils/
	nlp.js
	openaiClient.js
	pineconeClient.js
	swagger.js
	vectorDatabase.js
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Pinecone API Key
- OpenAI API Key

## Installation

1. Clone the repository:

```sh
git clone <repository-url>
cd <repository-directory>
```

2. Install the dependencies:

```sh
npm install
```

3. Create a `.env` file in the root directory and add your Pinecone and OpenAI API keys:

```
PINECONE_API_KEY=your-pinecone-api-key
OPENAI_API_KEY=your-openai-api-key
PINECONE_INDEX_ID=qa-index
```

## Running the Project

1. Start the server:

```sh
npm run start
```

2. The server will be running on `http://localhost:3000`. You can access the Swagger documentation at `http://localhost:3000/api-docs`.

## API Endpoints

### Ingest a Document

- **Endpoint:** `POST /ingest`
- **Description:** Upload a PDF or text file for processing.
- **Request:**
  - `file`: The file to be uploaded (PDF or text).

### Ask a Question

- **Endpoint:** `POST /question`
- **Description:** Get an answer based on ingested documents.
- **Request:**
  - `query`: The question to be asked.

### List Ingested Documents

- **Endpoint:** `GET /list`
- **Description:** Retrieves all documents from the `qa-index`.

### Delete All Documents

- **Endpoint:** `DELETE /clean`
- **Description:** Delete all documents from the `qa-index`.

## Development

To run the project in development mode with hot-reloading:

```sh
npm run dev
```

## Linting

To lint the project using ESLint:

```sh
npm run lint
```

## License

This project is licensed under the ISC License.
