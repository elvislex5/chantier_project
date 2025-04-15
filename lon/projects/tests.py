from django.test import SimpleTestCase

class DummyTest(SimpleTestCase):
    """Tests minimalistes ne dépendant d'aucun modèle et sans base de données"""

    def test_dummy(self):
        """Test vide qui passe toujours"""
        self.assertTrue(True)
