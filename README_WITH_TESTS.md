 # Projet LON - Gestion de Projets

Ce projet est une application web de gestion de projets construite avec Django (backend) et React (frontend).

## Architecture

- **Backend** : Django + Django REST Framework
- **Frontend** : React avec Vite, Material-UI et Tailwind CSS
- **Base de données** : PostgreSQL (en production), SQLite (en développement)

## Développement et Tests

### Exécution des tests

Le projet dispose d'une suite de tests unitaires et d'intégration complète pour le backend Django.

#### Exécuter les tests avec Docker

```bash
# Exécuter tous les tests
docker-compose run tests

# Exécuter les tests avec le rapport de couverture
docker-compose run tests pytest --cov=. --cov-report=html

# Exécuter des tests spécifiques
docker-compose run tests pytest projects/tests.py
docker-compose run tests pytest tasks/tests.py::TaskModelTest
```

#### Exécuter les tests sans Docker

```bash
# Se placer dans le répertoire du backend
cd lon

# Installer les dépendances de test
pip install -r test-requirements.txt

# Exécuter tous les tests
pytest

# Exécuter les tests avec le rapport de couverture
pytest --cov=. --cov-report=html
```

### Pratiques de développement recommandées

1. **Écrire des tests d'abord** : Suivre une approche TDD (Test-Driven Development)
2. **Exécuter les tests régulièrement** : Avant d'intégrer des modifications dans la branche principale
3. **Maintenir une bonne couverture de tests** : Viser au moins 80% de couverture de code

## Déploiement avec Docker

### Prérequis

- Docker
- Docker Compose

### Configuration

1. Copiez le fichier `.env-example` en `.env` et modifiez les valeurs selon votre environnement :

```bash
cp .env-example .env
```

2. Modifiez les variables d'environnement dans le fichier `.env` selon vos besoins.

### Lancement des services

Pour démarrer tous les services (base de données, backend, frontend) :

```bash
docker-compose up -d
```

### Accès aux services

- **Backend API** : http://localhost:8000/api/
- **Frontend** : http://localhost:8080/

### Commandes utiles

#### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
```

#### Exécuter des commandes Django

```bash
# Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser

# Effectuer des migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

#### Arrêter les services

```bash
docker-compose down
```

#### Reconstruire les images

```bash
docker-compose build
```

## Développement local sans Docker

### Backend (Django)

```bash
cd lon
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)

```bash
cd lon_front
npm install
npm run dev
```

## Déploiement en production

Pour un déploiement en production, assurez-vous de :

1. Utiliser un secret_key sécurisé dans les variables d'environnement
2. Configurer correctement les paramètres de sécurité
3. Utiliser HTTPS avec un certificat SSL valide
4. Configurer correctement les serveurs de messagerie

## Licence

Ce projet est sous licence [à déterminer].