#!/bin/bash
set -e

# Créer la base de données de test
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE lon_test_db;
  GRANT ALL PRIVILEGES ON DATABASE lon_test_db TO postgres;
EOSQL

echo "Base de données de test 'lon_test_db' créée avec succès" 