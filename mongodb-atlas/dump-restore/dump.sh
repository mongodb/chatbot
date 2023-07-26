#!/bin/bash
source ../.env.dev
mongodump -d $DUMP_DB -o mongodump/ --uri $MONGODB_CONNECTION_URI
