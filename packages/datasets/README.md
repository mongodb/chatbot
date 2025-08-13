# Datasets Package

This package provides utilities for importing, processing, and managing datasets used in the MongoDB Knowledge Service/Chatbot project. It contains both Node.js/TypeScript and Python implementations for various dataset operations.

## Overview

The datasets package is a hybrid TypeScript/Python package that handles:
- Dataset ingestion from various sources (HuggingFace, Atlas, etc.)
- Data processing and transformation pipelines
- MongoDB import/export operations
- Code example extraction and classification
- Natural language query generation
- Database metadata extraction

## Structure

### Node.js/TypeScript Components

Located in `/src/` directory:

- **Code Example Processing**: Extract and classify code examples from documentation
- **Page Dataset**: Load and process page-based datasets
- **Tree Generation**: Generate hierarchical data structures for NL queries
- **Database Operations**: MongoDB schema generation and database analysis
- **HuggingFace Integration**: Upload datasets to HuggingFace Hub
- **Evaluation**: Braintrust integration for dataset evaluation

### Python/UV Components

Located in `/mongodb_datasets/` directory:

- **Wikipedia Import**: Import Wikipedia datasets from HuggingFace to MongoDB
- **Atlas Search**: Configure and create Atlas Search indexes
- **Configuration Management**: Environment variable and project configuration

## Installation & Setup

### Node.js Dependencies
```bash
npm install
npm run build
```

### Python Dependencies (using uv)
```bash
# Install Python dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
```

## Usage

### Node.js Scripts

The package provides numerous npm scripts for different dataset operations:

```bash
# Build the project
npm run ...
```

### Python Scripts

The Python components provide CLI tools for dataset import operations:

```bash
# Import Wikipedia dataset (all articles)
uv run ...
```

## Configuration

### Environment Variables

For required environment variables, see `.env.example` in project root.
Create a `.env` file next to it with the required env vars.

## Development

### Testing
```bash
# Node.js tests
npm run test

# Linting
npm run lint
npm run lint:fix
```
