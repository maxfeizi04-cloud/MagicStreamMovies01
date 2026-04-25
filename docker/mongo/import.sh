#!/bin/sh
set -eu

MONGO_URI="${MONGO_URI:-mongodb://mongodb:27017}"
DATABASE_NAME="${DATABASE_NAME:-magicstream}"

echo "Waiting for MongoDB at ${MONGO_URI}..."
until mongosh "${MONGO_URI}/admin" --quiet --eval "db.runCommand({ ping: 1 }).ok" >/dev/null 2>&1; do
  sleep 2
done

for collection in genres rankings movies users
do
  echo "Importing ${collection}.json into ${DATABASE_NAME}.${collection}"
  mongoimport \
    --uri "${MONGO_URI}/${DATABASE_NAME}" \
    --collection "${collection}" \
    --drop \
    --file "/seed-data/${collection}.json" \
    --jsonArray
done

echo "MongoDB seed import completed."
