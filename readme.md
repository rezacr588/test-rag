# QA System Project

## Overview

This project is a comprehensive Question Answering (QA) system that allows users to ingest documents and ask questions based on the ingested content. It leverages modern technologies such as Pinecone for vector database management, OpenAI for generating embeddings and answers, and React for the frontend interface.

## Features

- **Document Ingestion:** Upload PDF or text files for processing and storage.
- **Question Answering:** Ask questions related to the ingested documents and receive accurate answers.
- **Topic Modeling:** Analyze and categorize document content using topic modeling techniques.
- **Interactive Frontend:** User-friendly interface developed with React and Material-UI.
- **API Documentation:** Comprehensive Swagger documentation for all API endpoints.

## Technology Stack

- **Backend:**

  - Node.js
  - Express.js
  - Pinecone Vector Database
  - OpenAI API
  - Swagger for API documentation
- **Frontend:**

  - React.js
  - Vite
  - Material-UI (MUI)
  - React Router
- **Topic Modeling:**

  - Python
  - Gensim
  - NLTK

## Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.7 or higher)
- **npm** (v6 or higher)
- **Pinecone API Key**
- **OpenAI API Key**

### Backend Setup

1. **Clone the repository:**

   ```sh
   git clone <repository-url>
   cd <repository-directory>/server
   ```
2. **Install dependencies:**

   ```sh
   npm install
   ```
3. **Configure environment variables:**

   Create a

.env

 file in the

server

 directory:

```
   PINECONE_API_KEY=your-pinecone-api-key
   OPENAI_API_KEY=your-openai-api-key
   PINECONE_INDEX_ID=qa-index
```

4. **Start the server:**

   ```sh
   npm run start
   ```

   The server will run on `http://localhost:3000`. Access Swagger documentation at `http://localhost:3000/api-docs`.

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```sh
   cd ../front-end
   ```
2. **Install dependencies:**

   ```sh
   npm install
   ```
3. **Start the frontend:**

   ```sh
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`.

### Topic Modeling Setup

1. **Navigate to the topic modeling directory:**

   ```sh
   cd ../topic-modeling
   ```
2. **Create a virtual environment and activate it:**

   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**

   ```sh
   pip install -r requirements.txt
   ```
4. **Configure environment variables:**

   Create a

.env

 file in the

topic-modeling

 directory:

```
   PINECONE_API_KEY=your-pinecone-api-key
   OPENAI_API_KEY=your-openai-api-key
   PINECONE_INDEX_ID=qa-index
   PINECONE_ENVIRONMENT=your-pinecone-environment
```

5. **Run the topic modeling script:**

   ```sh
   python main.py
   ```

## Usage

1. **Upload Documents:**

   - Navigate to the Upload page on the frontend.
   - Drag and drop a PDF or TXT file (max 5MB) or click to select a file.
   - Click "Upload" to ingest the document.
2. **Ask Questions:**

   - Navigate to the Chat page on the frontend.
   - Type your question and press "Send" or hit Enter.
   - View the answer along with relevant document chunks.

## API Endpoints

- **POST /ingest:** Upload and process a document.
- **POST /question:** Ask a question based on ingested documents.
- **GET /list:** Retrieve all ingested documents.
- **DELETE /clean:** Delete all documents from the index.

Refer to the Swagger documentation at `http://localhost:3000/api-docs` for detailed information.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the ISC License.
