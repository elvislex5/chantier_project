from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

class HealthCheckAPITest(TestCase):
    """
    Tests pour l'endpoint health-check de l'API.
    """
    
    def setUp(self):
        """Configuration avant chaque test"""
        self.client = APIClient()
    
    def test_health_check_endpoint(self):
        """
        Tester que l'endpoint health-check répond avec succès.
        """
        url = '/api/health-check/'  # URL directe au lieu de reverse
        response = self.client.get(url)
        
        # Vérifier que la requête a réussi
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier que la réponse contient un statut
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'ok')
        
        # Vérifier que la réponse contient des informations sur la base de données
        self.assertIn('database', response.data)
        self.assertTrue(response.data['database']) 