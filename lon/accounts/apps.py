from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    # Assurer que cette app est chargée en priorité car elle contient le modèle User personnalisé
    verbose_name = "Gestion des utilisateurs"
    
    # Définir une priorité haute pour cette app
    def ready(self):
        """Initialisation de l'application accounts."""
        # Vous pouvez ajouter d'autres initialisations ici si nécessaire
        pass
