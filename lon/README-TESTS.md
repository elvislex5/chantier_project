# Tests du Projet LON

Ce document explique comment exécuter les tests pour le projet LON en utilisant la nouvelle structure de tests et le fichier `docker-compose.yml` dans le répertoire racine.

## Architecture de Test

Notre architecture de test comprend plusieurs composants:

```
+---------------+          +---------------+          +----------------+
|               |          |               |          |                |
|  Frontend     |<-------->|  Backend      |<-------->|  Database      |
|  (React/Vite) |          |  (Django)     |          |  (PostgreSQL)  |
|               |          |  [contient    |          |                |
|               |          |   /tests]     |          |                |
+---------------+          +---------------+          +----------------+
        ^                         ^                          ^
        |                         |                          |
        +-------------------------+---------------------------+
                                  |
                         +----------------+
                         |                |
                         |  Tests         |
                         |  (Pytest)      |
                         |                |
                         +----------------+
```

**Note importante**: Les tests sont organisés à l'intérieur du répertoire backend (`lon/`), et non dans un répertoire séparé au même niveau que le backend.

## Organisation des Tests

Les tests sont organisés par type dans le répertoire `lon/tests/`:

- **`tests/unit/`**: Tests unitaires des modèles et fonctions
- **`tests/integration/`**: Tests d'intégration entre différents composants
- **`tests/api/`**: Tests des endpoints API REST

## Exécution des Tests

### Avec Docker Compose

Pour exécuter les tests avec Docker Compose (en utilisant le fichier `docker-compose.yml` du répertoire racine), utilisez les commandes suivantes:

```bash
# Exécuter tous les tests
docker-compose up tests

# Exécuter une commande spécifique dans le conteneur de tests 
docker-compose run tests bash -c "./run_tests.sh unit"        # Tests unitaires
docker-compose run tests bash -c "./run_tests.sh integration" # Tests d'intégration
docker-compose run tests bash -c "./run_tests.sh api"         # Tests API
docker-compose run tests bash -c "./run_tests.sh db"          # Tests de base de données
docker-compose run tests bash -c "./run_tests.sh frontend"    # Tests frontend-backend
docker-compose run tests bash -c "./run_tests.sh health"      # Tests health-check
docker-compose run tests bash -c "./run_tests.sh cov"         # Tests avec rapport de couverture
```

### En Local (sans Docker)

Pour exécuter les tests en local sans Docker, utilisez:

```bash
# Configurer l'environnement
export DJANGO_SETTINGS_MODULE=lon.settings_tests
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/lon_test_db

# Exécuter tous les tests
python -m pytest

# Exécuter des tests spécifiques
python -m pytest tests/unit/
python -m pytest tests/integration/
python -m pytest tests/api/
```

## Ajout de Nouveaux Tests

Pour ajouter de nouveaux tests:

1. Créez un fichier dans le répertoire approprié selon le type de test
2. Nommez le fichier en commençant par `test_` (par exemple, `test_models.py`)
3. Utilisez les classes de test Django (`TestCase`, `TransactionTestCase`, etc.)
4. Nommez les méthodes de test en commençant par `test_`

Exemple:

```python
from django.test import TestCase

class MyModelTest(TestCase):
    def setUp(self):
        # Configuration initiale
        pass
        
    def test_my_feature(self):
        # Test spécifique
        self.assertEqual(1 + 1, 2)
```

## Variables d'Environnement

Les tests utilisent les variables d'environnement suivantes (définies dans `docker-compose.yml`):

- `DATABASE_URL`: URL de connexion à la base de données
- `FRONTEND_URL`: URL du service frontend
- `API_URL`: URL de l'API backend
- `DJANGO_SETTINGS_MODULE`: Module de configuration Django

## Bonnes Pratiques

1. **Tests isolés**: Chaque test doit pouvoir s'exécuter de manière indépendante
2. **Tests rapides**: Les tests unitaires doivent être rapides
3. **Tests explicites**: Le but de chaque test doit être clair
4. **Tests maintenables**: Utilisez des méthodes de configuration (`setUp`) pour éviter la duplication de code
5. **Tests complets**: Testez les cas limites et les cas d'erreur, pas seulement les cas nominaux 