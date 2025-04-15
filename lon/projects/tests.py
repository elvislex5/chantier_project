from django.test import TestCase

class DummyTest(TestCase):
    """Tests minimalistes ne dépendant d'aucun modèle"""

    def test_dummy(self):
        """Test vide qui passe toujours"""
        self.assertTrue(True)
