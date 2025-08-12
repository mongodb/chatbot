#!/usr/bin/env python3
"""
Import Wikipedia dataset from HuggingFace to MongoDB

This script downloads the Simple English Wikipedia dataset from HuggingFace
and imports it into MongoDB with proper batching and error handling.
"""

import os
import sys
import logging
import argparse
from typing import Dict, Any, Optional
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel
from pymongo.collection import Collection
from pymongo.errors import BulkWriteError
from datasets import load_dataset
from datasets.arrow_dataset import Dataset
from jsonc_parser.parser import JsoncParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='{"level":"%(levelname)s","message":"%(message)s"}'
)
logger = logging.getLogger(__name__)

# Configuration
BATCH_SIZE = 1000
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
        
        try:
            # Look for the index file in the same directory as this script
            import pathlib
            script_dir = pathlib.Path(__file__).parent
            index_file = script_dir / "atlas_search_dataset_index.jsonc"
            
          
            # Parse JSONC to Python dictionary
            parser = JsoncParser()
            atlas_search_dataset_index: Dict[str, Any] = parser.parse_file(index_file)
            
            # Create the search index definition without the name
            definition = {
                "mappings": atlas_search_dataset_index["mappings"],
                "analyzers": atlas_search_dataset_index["analyzers"]
            }
            
            # Create the search index
            result = self.collection.create_search_index(model=SearchIndexModel(
                name=atlas_search_dataset_index["name"],
                definition=definition,
                type="search"
            ))
            logger.info(f"Search index creation result: {result}")
            logger.info(f"Created search index {atlas_search_dataset_index['name']} for {DATABASE_NAME}.{COLLECTION_NAME}")
        except FileNotFoundError:
            logger.info("Atlas search index file not found, skipping search index creation")
        except Exception as error:
            logger.warning(f"Search index creation failed (may already exist): {error}")
                
        

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

    def import_dataset(self, max_documents: Optional[int] = None, only_create_index: bool = False) -> None:
        """Import the Wikipedia dataset to MongoDB."""
        
        logger.info(f"Starting building DB indexes for {DATABASE_NAME}.{COLLECTION_NAME}")
        # Setup database
        self.setup_indexes()
        if only_create_index:
            logger.info(f"Only creating DB indexes for {DATABASE_NAME}.{COLLECTION_NAME}. Exiting...")
            return
        
        logger.info(f"Starting Wikipedia dataset import to {DATABASE_NAME}.{COLLECTION_NAME}")
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


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Import Wikipedia dataset from HuggingFace to MongoDB",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Import full dataset (all ~240k articles)
  uv run import-wikipedia

  # Import first 1000 articles for testing
  uv run import-wikipedia --max-documents 1000

  # Import 50k articles with custom connection
  uv run import-wikipedia --max-documents 50000 --mongodb-connection-uri mongodb://localhost:27017

  # Import full dataset with custom batch size
  uv run import-wikipedia --batch-size 2000
        """.strip()
    )
    
    parser.add_argument(
        "--max-documents",
        type=int,
        default=None,
        help="Maximum number of documents to import (default: None - import all documents)"
    )
    
    parser.add_argument(
        "--batch-size",
        type=int,
        default=BATCH_SIZE,
        help=f"Number of documents per batch (default: {BATCH_SIZE})"
    )
    
    parser.add_argument(
        "--mongodb-connection-uri",
        type=str,
        default=None,
        help="MongoDB connection URI (default: uses MONGODB_ATLAS_SEARCH_CONNECTION_URI env var)"
    )
    
    parser.add_argument(
        "--only-create-index",
        action="store_true",
        help="Only create the Atlas search index, skip importing data"
    )
    
    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    # Parse command line arguments
    args = parse_args()
    
    # Get MongoDB connection string - CLI arg takes precedence over env var
    connection_uri = args.mongodb_connection_uri or os.getenv("MONGODB_ATLAS_SEARCH_CONNECTION_URI")
    if not connection_uri:
        logger.error("MongoDB connection URI is required")
        logger.error("Provide via --mongodb-connection-uri or set MONGODB_ATLAS_SEARCH_CONNECTION_URI env var")
        sys.exit(1)
    
    # Log configuration
    if args.max_documents:
        logger.info(f"Importing up to {args.max_documents:,} documents")
    else:
        logger.info("Importing full dataset (all documents)")
    logger.info(f"Using batch size: {args.batch_size}")
    
    importer = None
    try:
        # Initialize importer
        importer = WikipediaImporter(connection_uri)
        logger.info("Connected to MongoDB")
        
        # Import dataset with CLI arguments
        importer.import_dataset(max_documents=args.max_documents, only_create_index=args.only_create_index)
        
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