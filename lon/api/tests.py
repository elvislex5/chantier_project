from django.test import TestCase
from django.db import connections
from django.conf import settings
import psycopg2
from psycopg2 import OperationalError
import os
import dj_database_url

class DatabaseConnectionTest(TestCase):
    """
    Tests vérifiant la connexion à la base de données PostgreSQL.
    Ces tests nécessitent que la base de données PostgreSQL soit en cours d'exécution.
    """
    
    def setUp(self):
        """Configuration pour les tests de base de données"""
        # Utiliser DATABASE_URL si disponible, sinon utiliser les paramètres de test par défaut
        if 'DATABASE_URL' in os.environ:
            self.db_config = dj_database_url.parse(os.environ.get('DATABASE_URL'))
        else:
            self.db_config = {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': 'lon_test_db',
                'USER': 'postgres',
                'PASSWORD': 'postgres',
                'HOST': 'db',  # Nom du service dans docker-compose
                'PORT': '5432',
            }
    
    def test_can_connect_to_db(self):
        """Vérifier que nous pouvons nous connecter à la base de données"""
        try:
            # Obtenir la connexion à la base de données
            conn = connections['default']
            conn.cursor()
            self.assertTrue(True)  # Si nous arrivons ici, la connexion réussit
        except OperationalError:
            self.fail("Impossible de se connecter à la base de données")
    
    def test_direct_postgresql_connection(self):
        """
        Vérifier que nous pouvons nous connecter directement à PostgreSQL.
        Ce test est spécifique à PostgreSQL et utilise psycopg2 directement.
        """
        if 'postgresql' not in settings.DATABASES['default']['ENGINE']:
            self.skipTest("Ce test nécessite une base de données PostgreSQL")
        
        try:
            # Extraire les paramètres de connexion
            params = {}
            
            if 'DATABASE_URL' in os.environ:
                params = {
                    'dbname': self.db_config['NAME'],
                    'user': self.db_config['USER'],
                    'password': self.db_config['PASSWORD'],
                    'host': self.db_config['HOST'],
                    'port': self.db_config['PORT'],
                }
            else:
                params = {
                    'dbname': settings.DATABASES['default']['NAME'],
                    'user': settings.DATABASES['default']['USER'],
                    'password': settings.DATABASES['default']['PASSWORD'],
                    'host': settings.DATABASES['default']['HOST'],
                    'port': settings.DATABASES['default']['PORT'],
                }
            
            # Tentative de connexion directe
            conn = psycopg2.connect(**params)
            conn.close()
            self.assertTrue(True)  # Si nous arrivons ici, la connexion réussit
        except Exception as e:
            self.fail(f"Impossible de se connecter directement à PostgreSQL: {str(e)}")
    
    def test_can_execute_query(self):
        """Vérifier que nous pouvons exécuter une requête simple"""
        try:
            # Obtenir la connexion et exécuter une requête simple
            with connections['default'].cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()[0]
                self.assertEqual(result, 1)
        except Exception as e:
            self.fail(f"Impossible d'exécuter une requête simple: {str(e)}")
