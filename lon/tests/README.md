# Structure des Tests

Ce répertoire contient tous les tests pour l'application LON. La structure a été conçue pour faciliter la maintenance et l'organisation des différents types de tests.

## Organisation

Les tests sont organisés par type:

- **`unit/`**: Tests unitaires des modèles et fonctions.
- **`integration/`**: Tests d'intégration entre différents composants.
- **`api/`**: Tests des endpoints API REST.

## Exécution des Tests

Les tests peuvent être exécutés en utilisant la configuration Docker Compose existante:

```bash
# Exécuter tous les tests automatiquement
docker-compose up tests

# Exécuter les tests avec une commande spécifique
docker-compose run tests bash -c "./run_tests.sh integration"  # Tests d'intégration
docker-compose run tests bash -c "./run_tests.sh unit"         # Tests unitaires
docker-compose run tests bash -c "./run_tests.sh api"          # Tests API
docker-compose run tests bash -c "./run_tests.sh db"           # Tests de base de données
docker-compose run tests bash -c "./run_tests.sh frontend"     # Tests frontend-backend
docker-compose run tests bash -c "./run_tests.sh health"       # Tests health-check
docker-compose run tests bash -c "./run_tests.sh cov"          # Tests avec rapport de couverture
```

## Architecture de test

Notre configuration Docker Compose définit une architecture complète pour les tests:

1. **Base de données (db)**: Service PostgreSQL pour les données
2. **Backend (backend)**: API Django pour le traitement des requêtes
3. **Frontend (frontend)**: Interface utilisateur
4. **Tests (tests)**: Conteneur dédié qui exécute les tests

Cette architecture permet de tester l'application dans un environnement similaire à la production.

## Types de Tests

### Tests Unitaires

Ces tests vérifient le comportement de fonctions et de classes spécifiques. Ils sont isolés et ne dépendent pas d'autres composants.

### Tests d'Intégration

Ces tests vérifient l'interaction entre différents composants du système:

- L'intégration avec la base de données PostgreSQL
- L'interaction entre le frontend et le backend via des requêtes HTTP

### Tests API

Ces tests vérifient le bon fonctionnement des endpoints API REST exposés par notre application Django.

## Variables d'environnement

Le service de tests utilise plusieurs variables d'environnement importantes:

- `DATABASE_URL`: URL de connexion à la base de données de test
- `FRONTEND_URL`: URL du service frontend pour les tests d'intégration
- `API_URL`: URL de l'API backend pour les tests
- `DJANGO_SETTINGS_MODULE`: Module de configuration Django pour les tests 