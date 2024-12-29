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
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
import numpy as np

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

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

def extract_topics(texts, num_topics=5):
    """
    Extract topics and their scores from texts
    Returns: List of tuples (topics, scores)
    """
    print("Starting extract_topics function")
    vectorizer = TfidfVectorizer(max_features=1000)
    nmf = NMF(n_components=num_topics)
    
    # Get document-term matrix
    dtm = vectorizer.fit_transform(texts)
    print("Document-term matrix shape:", dtm.shape)
    
    # Get topic-term and document-topic matrices
    topic_term = nmf.fit_transform(dtm)
    doc_topics = nmf.transform(dtm)
    print("Topic-term", topic_term)
    print("Topic-term matrix shape:", topic_term.shape)
    print("Document-topic matrix shape:", doc_topics.shape)
    
    # Get feature names
    terms = vectorizer.get_feature_names_out()
    print("Feature names:", terms)
    
    results = []
    for doc_topic in doc_topics:
        # Get top topics and their scores
        top_topics = [(i, float(score)) for i, score in enumerate(doc_topic)]
        top_topics.sort(key=lambda x: x[1], reverse=True)
        
        # Convert to format expected by metadata
        topics = [f"topic_{i}" for i, _ in top_topics[:3]]
        scores = [str(score) for _, score in top_topics[:3]]  # Convert scores to strings
        
        results.append({
            "topics": topics,
            "scores": scores
        })
    
    return results

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
    print(f"Found {len(file_chunks)} files with chunks")
    # Process each file's chunks
    for file_name, chunks in file_chunks.items():
        # Extract full texts for topic modeling
        texts = [chunk['text'] for chunk in chunks]
        
        # Perform topic modeling
        doc_topics = extract_topics(texts)
        # Update each chunk's metadata with topics
        for chunk, topic_data in zip(chunks, doc_topics):
            metadata = {
                'id': str(chunk['id']),
                'topics': topic_data['topics'],
                'topic_scores': topic_data['scores'],
            }
            metadata["topic_scores"] = [str(score) for score in metadata["topic_scores"]]
            metadata['topics'] = [str(topic) for topic in metadata['topics']]
            
            # Filter out None values
            metadata = {k: v for k, v in metadata.items() if v is not None}
            # Update in Pinecone
            index.update(
                id=chunk['id'],
                set_metadata=metadata
            )
        
        print(f"Updated topics for file: {file_name}")

if __name__ == "__main__":
    nltk.download('punkt_tab')
    update_pinecone_metadata()