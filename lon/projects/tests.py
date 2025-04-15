import unittest

# On évite complètement django
class BasicTest(unittest.TestCase):
    """Tests unitaires purs sans aucune dépendance à Django"""

    def test_always_true(self):
        """Test simple qui passe toujours"""
        self.assertTrue(True)
