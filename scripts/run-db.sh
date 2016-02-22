#!/bin/sh

if [ -z "$MONGO_DB_PATH" ]; then
	echo 'Error: Expose MONGO_DB_PATH as environment variable.'
	exit 1
fi

mongod --dbpath $MONGO_DB_PATH/data/db
