import unittest
import requests
import json
import os
import logging
from time import sleep
from datetime import datetime

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FrontendBackendIntegrationTest(unittest.TestCase):
    """Tests d'intégration entre le frontend et le backend pour CI."""

    def setUp(self):
        """Préparation des tests pour l'environnement CI."""
        # Dans l'environnement CI, tout est sur localhost
        self.backend_url = os.environ.get('API_URL', 'http://localhost:8000/api').rstrip('/api')
        self.frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:80')
        self.api_url = f"{self.backend_url}/api"
        
        logger.info(f"Backend URL: {self.backend_url}")
        logger.info(f"Frontend URL: {self.frontend_url}")
        logger.info(f"API URL: {self.api_url}")
        
        # Attendre que les services soient prêts
        self.wait_for_service(f"{self.api_url}/token/", max_retries=30)
        logger.info("Services prêts pour les tests.")

    def wait_for_service(self, url, max_retries=10, retry_interval=2):
        """Attend que le service soit disponible."""
        for attempt in range(max_retries):
            try:
                logger.info(f"Tentative de connexion à {url}...")
                response = requests.get(url, timeout=5)
                logger.info(f"Réponse reçue: {response.status_code}")
                # Accepter même les erreurs 400 car l'API peut être disponible mais rejeter 
                # les requêtes GET sur l'endpoint token (qui attend un POST)
                if response.status_code < 500:
                    logger.info(f"Service {url} disponible après {attempt + 1} tentatives.")
                    return True
            except requests.RequestException as e:
                logger.info(f"Tentative {attempt + 1}/{max_retries}: Service {url} non disponible. Erreur: {str(e)}")
            
            if attempt < max_retries - 1:
                sleep(retry_interval)
        
        logger.error(f"Service {url} non disponible après {max_retries} tentatives.")
        return False

    def get_auth_token(self):
        """Obtient un token d'authentification JWT pour l'admin."""
        url = f"{self.api_url}/token/"
        
        # Créer un utilisateur admin si nécessaire (pour les tests CI)
        try:
            logger.info("Tentative de création de l'utilisateur admin pour CI...")
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(username="admin").exists():
                User.objects.create_superuser("admin", "admin@example.com", "admin")
                logger.info("Utilisateur admin créé avec succès pour CI")
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'admin: {str(e)}")
        
        credentials = {
            "username": "admin",
            "password": "admin"
        }
        
        try:
            # Obtenir le token
            logger.info(f"Demande de token à {url} avec les identifiants admin...")
            response = requests.post(url, json=credentials)
            logger.info(f"Réponse: {response.status_code}")
            
            if response.status_code == 200:
                logger.info("Authentification réussie")
                return response.json()
            else:
                logger.error(f"Échec d'authentification. Statut: {response.status_code}, Réponse: {response.text}")
                return None
        except requests.RequestException as e:
            logger.error(f"Erreur lors de l'authentification: {str(e)}")
            return None

    def test_api_status(self):
        """
        Teste l'état de l'API en vérifiant plusieurs endpoints.
        Cette approche est plus fiable que de se fier uniquement à l'endpoint health-check.
        """
        # Test de l'authentification
        token_data = self.get_auth_token()
        self.assertIsNotNone(token_data, "Impossible d'obtenir un token d'authentification")
        self.assertIn('access', token_data, "La réponse du token ne contient pas de clé 'access'")
        
        # Préparer les en-têtes d'authentification pour les endpoints protégés
        auth_headers = {"Authorization": f"Bearer {token_data['access']}"}
        
        # Liste des endpoints à tester (publics et protégés)
        endpoints = [
            # Endpoint public
            {"url": f"{self.api_url}/token/", "method": "post", "data": {"username": "admin", "password": "admin"}},
            # Endpoints protégés
            {"url": f"{self.api_url}/users/", "method": "get", "headers": auth_headers},
            {"url": f"{self.api_url}/projects/", "method": "get", "headers": auth_headers}
        ]
        
        for endpoint in endpoints:
            try:
                url = endpoint["url"]
                method = endpoint.get("method", "get").lower()
                headers = endpoint.get("headers", {})
                data = endpoint.get("data", None)
                
                logger.info(f"Test de l'endpoint: {url}")
                
                if method == "get":
                    response = requests.get(url, headers=headers, timeout=10)
                elif method == "post":
                    response = requests.post(url, json=data, headers=headers, timeout=10)
                else:
                    self.fail(f"Méthode non prise en charge: {method}")
                
                # Vérifier que la réponse est un succès (2xx)
                logger.info(f"  - Statut: {response.status_code}")
                self.assertTrue(200 <= response.status_code < 300, 
                                f"L'endpoint {url} a renvoyé un statut {response.status_code}: {response.text}")
                
                # Vérifier que la réponse est un JSON valide
                try:
                    response_data = response.json()
                    self.assertIsNotNone(response_data, f"L'endpoint {url} a renvoyé un JSON vide")
                    
                    if url.endswith('/users/'):
                        self.assertIsInstance(response_data, list)
                        logger.info(f"  - {len(response_data)} utilisateurs récupérés")
                    
                    if url.endswith('/projects/'):
                        self.assertIsInstance(response_data, list)
                        logger.info(f"  - {len(response_data)} projets récupérés")
                        
                except json.JSONDecodeError:
                    self.fail(f"L'endpoint {url} n'a pas renvoyé un JSON valide: {response.text}")
                    
                logger.info(f"Endpoint {url} testé avec succès")
                
            except requests.RequestException as e:
                self.fail(f"Erreur lors de la requête à l'endpoint {endpoint['url']}: {str(e)}")

if __name__ == '__main__':
    unittest.main() 