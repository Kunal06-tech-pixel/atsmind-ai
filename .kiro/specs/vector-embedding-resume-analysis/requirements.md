# Requirements Document

## Introduction

This document specifies the requirements for implementing the E5-base-v2 vector embedding model for semantic resume analysis in a JavaScript/Node.js backend. The system will replace direct LLM API calls with a vector embedding-based approach that uses the intfloat/e5-base-v2 model for semantic similarity matching between resumes and job descriptions.

The implementation will integrate with the existing Express/MongoDB architecture while providing improved semantic understanding through transformer-based embeddings with query/passage prefixing, average pooling, L2 normalization, and cosine similarity scoring.

## Glossary

- **E5_Model**: The intfloat/e5-base-v2 transformer model for generating text embeddings
- **Embedding_Service**: JavaScript service that loads and runs the E5 model
- **Tokenizer**: Component that converts text into token IDs with max_length=512
- **Pooling_Layer**: Component that performs average pooling on hidden states
- **Normalization_Layer**: Component that applies L2 normalization to embeddings
- **Similarity_Calculator**: Component that computes cosine similarity between embeddings
- **Resume_Analyzer**: Service that uses embeddings for resume analysis
- **Vector_Store**: MongoDB collection storing document embeddings
- **Query_Prefix**: The string "query: " prepended to search queries
- **Passage_Prefix**: The string "passage: " prepended to documents
- **ONNX_Runtime**: JavaScript runtime for executing ONNX model files
- **Transformer_JS**: JavaScript library for running transformer models
- **Resume_Controller**: Express controller handling resume analysis endpoints
- **Analysis_Model**: MongoDB schema for storing analysis results

## Requirements

### Requirement 1: E5 Model Integration

**User Story:** As a backend developer, I want to integrate the E5-base-v2 model in JavaScript, so that I can generate semantic embeddings without Python dependencies.

#### Acceptance Criteria

1. THE Embedding_Service SHALL load the intfloat/e5-base-v2 model using Transformer_JS or ONNX_Runtime
2. WHEN the model is loaded, THE Embedding_Service SHALL verify model initialization and log success status
3. THE Embedding_Service SHALL support both query and passage embedding modes
4. WHERE model loading fails, THE Embedding_Service SHALL throw a descriptive error with failure reason
5. THE Embedding_Service SHALL cache the loaded model in memory for reuse across requests

### Requirement 2: Text Tokenization

**User Story:** As a backend developer, I want to tokenize text with proper length limits, so that inputs conform to the E5 model's requirements.

#### Acceptance Criteria

1. THE Tokenizer SHALL convert input text into token IDs using the E5-base-v2 tokenizer
2. THE Tokenizer SHALL enforce a maximum token length of 512 tokens
3. WHEN text exceeds 512 tokens, THE Tokenizer SHALL truncate to 512 tokens
4. THE Tokenizer SHALL add special tokens (CLS, SEP) as required by the BERT architecture
5. THE Tokenizer SHALL return attention masks indicating valid token positions
6. FOR ALL valid text inputs, tokenizing then decoding SHALL preserve semantic meaning (round-trip property)

### Requirement 3: Query and Passage Prefixing

**User Story:** As a backend developer, I want to apply proper prefixes to queries and passages, so that the E5 model generates optimized embeddings for retrieval tasks.

#### Acceptance Criteria

1. WHEN generating embeddings for job descriptions or search queries, THE Embedding_Service SHALL prepend Query_Prefix to the text
2. WHEN generating embeddings for resume text, THE Embedding_Service SHALL prepend Passage_Prefix to the text
3. THE Embedding_Service SHALL apply prefixes before tokenization
4. THE Embedding_Service SHALL expose separate methods for query and passage embedding generation
5. WHERE no prefix is specified, THE Embedding_Service SHALL default to passage mode

### Requirement 4: Average Pooling Implementation

**User Story:** As a backend developer, I want to implement average pooling of hidden states, so that I can generate fixed-size embeddings from variable-length sequences.

#### Acceptance Criteria

1. THE Pooling_Layer SHALL extract the last hidden state from the model output
2. THE Pooling_Layer SHALL apply attention mask weighting to hidden states
3. THE Pooling_Layer SHALL compute the mean across the sequence dimension for each feature
4. THE Pooling_Layer SHALL return a 768-dimensional embedding vector
5. FOR ALL valid token sequences, the pooled embedding dimension SHALL equal 768

### Requirement 5: L2 Normalization

**User Story:** As a backend developer, I want to normalize embeddings using L2 normalization, so that cosine similarity can be computed efficiently.

#### Acceptance Criteria

1. THE Normalization_Layer SHALL compute the L2 norm of the embedding vector
2. THE Normalization_Layer SHALL divide each embedding component by the L2 norm
3. WHEN the L2 norm is zero, THE Normalization_Layer SHALL return a zero vector
4. THE Normalization_Layer SHALL ensure normalized embeddings have unit length
5. FOR ALL non-zero embeddings, the L2 norm of the normalized embedding SHALL equal 1.0 within floating-point precision

### Requirement 6: Cosine Similarity Calculation

**User Story:** As a backend developer, I want to compute cosine similarity between embeddings, so that I can measure semantic similarity between resumes and job descriptions.

#### Acceptance Criteria

1. THE Similarity_Calculator SHALL compute the dot product of two normalized embeddings
2. THE Similarity_Calculator SHALL return similarity scores in the range [-1, 1]
3. THE Similarity_Calculator SHALL handle batch similarity computation for multiple embedding pairs
4. WHEN embeddings are L2-normalized, THE Similarity_Calculator SHALL use dot product as cosine similarity
5. FOR ALL pairs of identical embeddings, the similarity score SHALL equal 1.0 within floating-point precision

### Requirement 7: Resume Analysis Integration

**User Story:** As a backend developer, I want to integrate vector embeddings into the resume analysis flow, so that I can replace direct LLM calls with semantic similarity matching.

#### Acceptance Criteria

1. THE Resume_Analyzer SHALL generate embeddings for uploaded resume text
2. THE Resume_Analyzer SHALL generate embeddings for job description text
3. THE Resume_Analyzer SHALL compute similarity scores between resume and job description embeddings
4. THE Resume_Analyzer SHALL extract skills and keywords using embedding-based semantic matching
5. THE Resume_Analyzer SHALL generate ATS scores based on embedding similarity metrics
6. WHEN job description is empty, THE Resume_Analyzer SHALL perform general resume quality analysis
7. THE Resume_Analyzer SHALL maintain backward compatibility with existing Analysis_Model schema

### Requirement 8: Vector Storage in MongoDB

**User Story:** As a backend developer, I want to store embeddings in MongoDB, so that I can cache and reuse embeddings for analysis.

#### Acceptance Criteria

1. THE Analysis_Model SHALL include an optional field for storing resume embeddings
2. THE Analysis_Model SHALL include an optional field for storing job description embeddings
3. THE Vector_Store SHALL store embeddings as arrays of 768 floating-point numbers
4. WHEN an analysis is created, THE Vector_Store SHALL persist embeddings alongside analysis results
5. THE Vector_Store SHALL support querying analyses by embedding similarity

### Requirement 9: Embedding Service API

**User Story:** As a backend developer, I want a clean API for the embedding service, so that I can easily integrate it into controllers.

#### Acceptance Criteria

1. THE Embedding_Service SHALL expose an `embedQuery(text)` method for query embeddings
2. THE Embedding_Service SHALL expose an `embedPassage(text)` method for passage embeddings
3. THE Embedding_Service SHALL expose a `computeSimilarity(embedding1, embedding2)` method
4. THE Embedding_Service SHALL expose a `batchEmbed(texts, mode)` method for batch processing
5. THE Embedding_Service SHALL return embeddings as Float32Array or standard JavaScript arrays
6. WHERE embedding generation fails, THE Embedding_Service SHALL throw descriptive errors

### Requirement 10: Performance Optimization

**User Story:** As a backend developer, I want optimized embedding generation, so that resume analysis remains performant.

#### Acceptance Criteria

1. THE Embedding_Service SHALL generate embeddings in under 500ms for texts up to 512 tokens
2. THE Embedding_Service SHALL support batch embedding generation for multiple texts
3. THE Embedding_Service SHALL reuse the loaded model across multiple requests
4. WHERE possible, THE Embedding_Service SHALL use GPU acceleration via ONNX Runtime
5. THE Embedding_Service SHALL implement connection pooling for model inference

### Requirement 11: Error Handling and Validation

**User Story:** As a backend developer, I want robust error handling, so that the system gracefully handles invalid inputs and model failures.

#### Acceptance Criteria

1. WHEN text input is null or undefined, THE Embedding_Service SHALL throw a validation error
2. WHEN text input is empty string, THE Embedding_Service SHALL return a zero embedding or throw an error
3. WHEN model loading fails, THE Embedding_Service SHALL log the error and throw a descriptive exception
4. WHEN tokenization fails, THE Embedding_Service SHALL throw a descriptive error
5. THE Embedding_Service SHALL validate embedding dimensions before returning results
6. WHERE GPU acceleration is unavailable, THE Embedding_Service SHALL fall back to CPU execution

### Requirement 12: Resume Controller Integration

**User Story:** As a backend developer, I want to update the resume controller to use embeddings, so that the analysis flow uses the new embedding-based approach.

#### Acceptance Criteria

1. THE Resume_Controller SHALL call Embedding_Service for resume and job description embeddings
2. THE Resume_Controller SHALL compute similarity scores using the Similarity_Calculator
3. THE Resume_Controller SHALL generate ATS scores based on embedding similarity
4. THE Resume_Controller SHALL maintain the existing API response format
5. THE Resume_Controller SHALL handle embedding service errors gracefully
6. WHERE embedding generation fails, THE Resume_Controller SHALL fall back to basic text analysis or return an error

### Requirement 13: Dependency Management

**User Story:** As a backend developer, I want to install required JavaScript libraries, so that I can run transformer models in Node.js.

#### Acceptance Criteria

1. THE package.json SHALL include @xenova/transformers or onnxruntime-node as a dependency
2. THE package.json SHALL specify compatible versions for all embedding-related dependencies
3. WHEN dependencies are installed, THE system SHALL verify successful installation
4. THE system SHALL document any platform-specific installation requirements
5. WHERE native dependencies are required, THE system SHALL provide installation instructions

### Requirement 14: Configuration Management

**User Story:** As a backend developer, I want configurable embedding service settings, so that I can tune performance and behavior.

#### Acceptance Criteria

1. THE Embedding_Service SHALL support configuration for model path or model identifier
2. THE Embedding_Service SHALL support configuration for maximum token length
3. THE Embedding_Service SHALL support configuration for batch size
4. THE Embedding_Service SHALL support configuration for device selection (CPU/GPU)
5. THE Embedding_Service SHALL load configuration from environment variables or config files
6. WHERE configuration is invalid, THE Embedding_Service SHALL use sensible defaults and log warnings

### Requirement 15: Testing and Validation

**User Story:** As a backend developer, I want to validate the embedding implementation, so that I can ensure correctness against the reference Python implementation.

#### Acceptance Criteria

1. THE system SHALL include test cases comparing JavaScript embeddings with reference Python embeddings
2. THE system SHALL validate that embedding dimensions are correct (768)
3. THE system SHALL validate that embeddings are properly normalized (L2 norm = 1.0)
4. THE system SHALL validate that cosine similarity calculations are correct
5. THE system SHALL include test cases for query/passage prefix handling
6. FOR ALL test inputs, the JavaScript implementation SHALL produce embeddings within 0.01 cosine similarity of the Python reference implementation
