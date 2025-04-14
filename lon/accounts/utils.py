from .models import Notification


def create_notification(user, message):
    """
       Crée une notification pour un utilisateur spécifique.
       """
    Notification.objects.create(user=user, message=message)
