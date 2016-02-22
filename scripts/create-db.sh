#!/bin/sh

if [ -z "$MONGO_DB_PATH" ]; then
	echo 'Error: Expose MONGO_DB_PATH as environment variable.'
	exit 1
fi

mkdir -p $MONGO_DB_PATH/data/db
chmod 775 $MONGO_DB_PATH/data/db
