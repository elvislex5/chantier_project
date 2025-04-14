"""
Configuration pour les tests CI dans GitHub Actions.
Ce fichier hérite des paramètres de test mais modifie la connexion à la base de données
pour utiliser 'localhost' au lieu de 'db'.
"""

from .settings_tests import *

# Redéfinir DATABASE_URL pour utiliser localhost au lieu de 'db'
import os
import dj_database_url

# Utiliser l'URL de la base de données des environnements CI
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/lon_test_db')
DATABASES['default'] = dj_database_url.parse(DATABASE_URL) 