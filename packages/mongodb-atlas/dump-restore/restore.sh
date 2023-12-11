#!/bin/bash

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
  echo "No environment provided. Please provide an environment (e.g. dev, test, staging)"
  exit 1
fi

PROJECT_DIR=$(git rev-parse --show-toplevel)/mongodb-atlas
ENV_PATH=$PROJECT_DIR/.env.$ENVIRONMENT
source $ENV_PATH

DB_DUMP_PATH=$PROJECT_DIR/dump-restore/mongodump/$DUMP_DB

mongorestore -d $DB_NAME $DB_DUMP_PATH --uri $MONGODB_CONNECTION_URI --drop
echo "Restored $DUMP_DB to $DB_NAME"
