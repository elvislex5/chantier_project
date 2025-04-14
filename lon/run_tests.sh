#!/bin/bash

# Informations de diagnostic
echo "=== Informations de diagnostic ==="
echo "Contenu de /etc/hosts:"
cat /etc/hosts
echo "=== Fin des informations de diagnostic ==="

# Attendre que PostgreSQL soit prêt (délai supplémentaire)
echo "Attente initiale pour laisser PostgreSQL démarrer..."
sleep 10

# Attendre que la base de données soit disponible
echo "Attente de la disponibilité de la base de données PostgreSQL..."
for i in {1..30}; do
  echo "Tentative $i: Test de connexion à PostgreSQL..."
  
  # Afficher plus d'informations pour le diagnostic
  echo "Ping db:"
  ping -c 1 db || echo "Ping échoué"
  
  # Tester la connexion avec plus de détails
  PGPASSWORD=postgres psql -h db -U postgres -c "SELECT 1" -v ON_ERROR_STOP=1
  if [ $? -eq 0 ]; then
    echo "Base de données PostgreSQL disponible après $i tentatives."
    break
  fi
  
  echo "Tentative $i: Base de données PostgreSQL non disponible, attente..."
  sleep 5
  
  if [ $i -eq 30 ]; then
    echo "Échec de connexion à PostgreSQL après 30 tentatives."
    exit 1
  fi
done

# Créer la base de données de test si elle n'existe pas
echo "Vérification de la base de données de test..."
PGPASSWORD=postgres psql -h db -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'lon_test_db'" | grep -q 1
if [ $? -ne 0 ]; then
    echo "Création de la base de données de test..."
    PGPASSWORD=postgres psql -h db -U postgres -c "CREATE DATABASE lon_test_db"
    if [ $? -ne 0 ]; then
        echo "Échec de création de la base de données lon_test_db."
        exit 1
    fi
    echo "Base de données lon_test_db créée avec succès."
fi

# Exécuter les migrations sur la base de données de test
echo "Exécution des migrations..."
python manage.py migrate --noinput

# Options de pytest communes
PYTEST_OPTIONS="--reuse-db -v"

# Exécuter les tests en fonction du paramètre
if [ "$1" = "api" ]; then
    echo "Exécution des tests d'API..."
    python -m pytest tests/api $PYTEST_OPTIONS
elif [ "$1" = "unit" ]; then
    echo "Exécution des tests unitaires des modèles..."
    python -m pytest api/tests.py projects/tests.py $PYTEST_OPTIONS
elif [ "$1" = "health" ]; then
    echo "Exécution des tests health-check..."
    python -m pytest tests/api/test_health_check.py $PYTEST_OPTIONS
elif [ "$1" = "reset-db" ]; then
    echo "Réinitialisation de la base de données de test..."
    # Tuer toutes les connexions à la base de données de test
    PGPASSWORD=postgres psql -h db -U postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'lon_test_db' AND pid <> pg_backend_pid();"
    # Supprimer la base de données de test
    PGPASSWORD=postgres psql -h db -U postgres -c "DROP DATABASE IF EXISTS lon_test_db;"
    # Recréer la base de données de test
    PGPASSWORD=postgres psql -h db -U postgres -c "CREATE DATABASE lon_test_db;"
    echo "Base de données de test réinitialisée."
    exit 0
else
    echo "Exécution des tests essentiels..."
    # Exécuter uniquement les tests API les plus fiables
    python -m pytest tests/api/test_health_check.py api/tests.py $PYTEST_OPTIONS
fi

# Récupérer le code de sortie de pytest
EXIT_CODE=$?

# Afficher un message en fonction du résultat
if [ $EXIT_CODE -eq 0 ]; then
    echo "Tous les tests ont réussi! 🎉"
else
    echo "Certains tests ont échoué. 😢"
fi

# Sortir avec le code de sortie de pytest
exit $EXIT_CODE 