#!/usr/bin/env python3
"""
Import Wikipedia dataset from HuggingFace to MongoDB

This script downloads the Simple English Wikipedia dataset from HuggingFace
and imports it into MongoDB with proper batching and error handling.
"""

import os
import sys
import logging
from typing import Dict, Any, Optional
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import BulkWriteError
from datasets import load_dataset
from datasets.arrow_dataset import Dataset

from .config import load_environment

# Load environment variables
load_environment()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='{"level":"%(levelname)s","message":"%(message)s"}'
)
logger = logging.getLogger(__name__)

# Configuration
BATCH_SIZE = 1000
MAX_DOCUMENTS = None  # Set to None for full dataset
DATABASE_NAME = "wikipedia_dataset"
COLLECTION_NAME = "articles"

# MongoDB document size limit (16MB) with safety margin
MAX_TEXT_SIZE = 15 * 1024 * 1024  # 15MB


class WikipediaImporter:
    """Handles importing Wikipedia dataset from HuggingFace to MongoDB."""
    
    def __init__(self, connection_uri: str):
        self.client = MongoClient(connection_uri)
        self.db = self.client[DATABASE_NAME]
        self.collection: Collection = self.db[COLLECTION_NAME]
        self.stats = {
            "processed": 0,
            "inserted": 0,
            "skipped_oversized": 0,
            "skipped_duplicates": 0,
            "errors": 0
        }

    def setup_indexes(self) -> None:
        """Create necessary indexes for performance and uniqueness."""
        try:
            self.collection.create_index("id", unique=True, background=True)
            logger.info("Created unique index on 'id' field")
        except Exception as error:
            logger.warning(f"Index creation failed (may already exist): {error}")

    def load_wikipedia_dataset(self) -> Dataset:
        """Load the Wikipedia dataset from HuggingFace."""
        logger.info("Loading Wikipedia dataset from HuggingFace...")
        
        try:
            # Load the Simple English Wikipedia dataset
            dataset = load_dataset(
                "wikimedia/wikipedia",
                "20231101.simple",
                split="train",
                streaming=False  # Load full dataset for better performance
            )
            
            logger.info(f"Dataset loaded successfully. Total records: {len(dataset)}")
            return dataset
            
        except Exception as error:
            logger.error(f"Failed to load dataset: {error}")
            raise

    def process_record(self, record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process a single Wikipedia record."""
        try:
            # Extract and validate fields
            article_id = str(record.get("id", ""))
            url = str(record.get("url", ""))
            title = str(record.get("title", ""))
            text = str(record.get("text", ""))
            
            # Skip articles with oversized text
            text_size = len(text.encode('utf-8'))
            if text_size > MAX_TEXT_SIZE:
                logger.warning(f"Skipping article {article_id} - text too large ({text_size // 1024 // 1024}MB)")
                self.stats["skipped_oversized"] += 1
                return None
            
            # Create MongoDB document
            document = {
                "id": article_id,
                "url": url,
                "title": title,
                "text": text
            }
            
            return document
            
        except Exception as error:
            logger.warning(f"Error processing record: {error}")
            self.stats["errors"] += 1
            return None

    def insert_batch(self, batch: list) -> int:
        """Insert a batch of documents into MongoDB."""
        if not batch:
            return 0
            
        try:
            result = self.collection.insert_many(batch, ordered=False)
            inserted_count = len(result.inserted_ids)
            logger.info(f"Inserted {inserted_count} documents to {DATABASE_NAME}.{COLLECTION_NAME}")
            return inserted_count
            
        except BulkWriteError as error:
            # Handle partial success with duplicate key errors
            inserted_count = error.details.get('nInserted', 0)
            duplicate_errors = [e for e in error.details.get('writeErrors', []) if e.get('code') == 11000]
            other_errors = [e for e in error.details.get('writeErrors', []) if e.get('code') != 11000]
            
            if duplicate_errors:
                logger.info(f"Inserted {inserted_count} documents, skipped {len(duplicate_errors)} duplicates")
                self.stats["skipped_duplicates"] += len(duplicate_errors)
            
            if other_errors:
                logger.warning(f"Encountered {len(other_errors)} other errors during batch insert")
                self.stats["errors"] += len(other_errors)
                
            return inserted_count
            
        except Exception as error:
            logger.error(f"Failed to insert batch: {error}")
            self.stats["errors"] += len(batch)
            return 0

    def import_dataset(self, max_documents: Optional[int] = None) -> None:
        """Import the Wikipedia dataset to MongoDB."""
        logger.info(f"Starting Wikipedia dataset import to {DATABASE_NAME}.{COLLECTION_NAME}")
        
        # Setup database
        self.setup_indexes()
        
        # Load dataset
        dataset = self.load_wikipedia_dataset()
        
        # Process in batches
        batch = []
        total_processed = 0
        
        # Limit dataset if specified
        if max_documents:
            dataset = dataset.select(range(min(max_documents, len(dataset))))
            logger.info(f"Limited dataset to {len(dataset)} documents for testing")
        
        for record in dataset:
            if max_documents and total_processed >= max_documents:
                break
                
            processed_record = self.process_record(record)
            if processed_record:
                batch.append(processed_record)
            
            total_processed += 1
            self.stats["processed"] = total_processed
            
            # Insert batch when it reaches the batch size
            if len(batch) >= BATCH_SIZE:
                inserted = self.insert_batch(batch)
                self.stats["inserted"] += inserted
                batch = []
            
            # Progress logging
            if total_processed % 5000 == 0:
                logger.info(f"Processed {total_processed} records...")
        
        # Insert remaining batch
        if batch:
            inserted = self.insert_batch(batch)
            self.stats["inserted"] += inserted
        
        # Final statistics
        logger.info(f"Import completed. Stats: {self.stats}")

    def close(self) -> None:
        """Close the database connection."""
        self.client.close()
        logger.info("MongoDB connection closed")


def main() -> None:
    """Main entry point."""
    # Get MongoDB connection string from environment
    connection_uri = os.getenv("MONGODB_ATLAS_SEARCH_CONNECTION_URI")
    if not connection_uri:
        logger.error("MONGODB_ATLAS_SEARCH_CONNECTION_URI environment variable is required")
        logger.error("Please set it in your .env file or export it directly")
        sys.exit(1)
    
    importer = None
    try:
        # Initialize importer
        importer = WikipediaImporter(connection_uri)
        logger.info("Connected to MongoDB")
        
        # Import dataset
        importer.import_dataset(max_documents=MAX_DOCUMENTS)
        
        logger.info("Wikipedia dataset import completed successfully")
        
    except KeyboardInterrupt:
        logger.info("Import interrupted by user")
        sys.exit(0)
        
    except Exception as error:
        logger.error(f"Import failed: {error}")
        sys.exit(1)
        
    finally:
        if importer:
            importer.close()


if __name__ == "__main__":
    main()