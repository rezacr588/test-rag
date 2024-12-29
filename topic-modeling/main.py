import ssl
import nltk
import os
from dotenv import load_dotenv
import pinecone
from gensim import corpora, models
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from pinecone import Pinecone, ServerlessSpec

# SSL Configuration
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download NLTK data with SSL workaround
def ensure_nltk_data():
    required_packages = ['punkt', 'stopwords', 'wordnet']
    for package in required_packages:
        try:
            nltk.data.find(f'tokenizers/{package}')
        except LookupError:
            nltk.download(package)

# Initialize NLTK
ensure_nltk_data()

# Load environment variables
load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")
environment = os.getenv("PINECONE_ENVIRONMENT")
index_id = os.getenv("PINECONE_INDEX_ID")

if not api_key or not environment:
    raise ValueError("PINECONE_API_KEY and PINECONE_ENVIRONMENT must be set in the environment variables.")

# Initialize Pinecone
pc = Pinecone(
    api_key=os.environ.get("PINECONE_API_KEY")
)

# Initialize the index with the host
index = pc.Index(index_id)

def preprocess_text(text):
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text.lower())
    # Tokenize
    tokens = word_tokenize(text.lower())
    
    # Remove stopwords and lemmatize
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    
    tokens = [
        lemmatizer.lemmatize(token) 
        for token in tokens 
        if token.isalnum() and token not in stop_words
    ]
    
    return tokens

def extract_topics(documents, num_topics=5):
    # Preprocess all documents
    processed_docs = [preprocess_text(doc) for doc in documents]
    
    # Create dictionary and corpus
    dictionary = corpora.Dictionary(processed_docs)
    corpus = [dictionary.doc2bow(doc) for doc in processed_docs]
    
    # Train LDA model
    lda_model = models.LdaModel(
        corpus,
        num_topics=num_topics,
        id2word=dictionary,
        passes=15,
        random_state=42
    )
    
    # Extract topics for each document
    doc_topics = []
    for doc_bow in corpus:
        topics = lda_model.get_document_topics(doc_bow)
        # Sort topics by probability and get top topic terms
        topics = sorted(topics, key=lambda x: x[1], reverse=True)
        top_topics = [
            {
                'topic_id': topic_id,
                'probability': prob,
                'terms': [term for term, _ in lda_model.show_topic(topic_id, 5)]
            }
            for topic_id, prob in topics
        ]
        doc_topics.append(top_topics)
    
    return doc_topics

def update_pinecone_metadata():
    # Get all vectors from Pinecone
    query_response = index.query(
        vector=[0] * 1536,  # Zero vector to match all
        top_k=10000,
        include_metadata=True
    )
    
    # Group chunks by file
    file_chunks = {}
    for match in query_response['matches']:
        file_name = match.metadata.get('fileName')
        if file_name:
            if file_name not in file_chunks:
                file_chunks[file_name] = []
            file_chunks[file_name].append({
                'id': match.id,
                'text': match.metadata.get('text', ''),
                'metadata': match.metadata
            })
    
    # Process each file's chunks
    for file_name, chunks in file_chunks.items():
        # Extract full texts for topic modeling
        texts = [chunk['text'] for chunk in chunks]
        
        # Perform topic modeling
        doc_topics = extract_topics(texts)
        
        # Update each chunk's metadata with topics
        for chunk, topics in zip(chunks, doc_topics):
            updated_metadata = chunk['metadata']
            updated_metadata['topics'] = topics
            
            # Convert any float32 values to regular floats
            metadata = {
                'id': str(chunk['id']),  # Ensure ID is string
                # Convert other float32 values to regular float
                'topic_scores': [float(score) for score in chunk['metadata'].get('topic_scores', [])],
                'other_metadata': float(chunk['metadata'].get('other_value', 0))
            }
            
            # Filter out None values
            metadata = {k: v for k, v in metadata.items() if v is not None}
            
            # Update in Pinecone
            index.update(
                id=chunk['id'],
                metadata=metadata
            )
        
        print(f"Updated topics for file: {file_name}")

if __name__ == "__main__":
    nltk.download('punkt_tab')
    update_pinecone_metadata()