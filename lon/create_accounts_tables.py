"""
Script pour forcer la création des tables nécessaires pour le modèle User
si les migrations Django échouent.
"""

import os
import django
import sys
from django.db import connection

# Configurer Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lon.settings_ci')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model

# Récupérer le modèle User
User = get_user_model()
print(f"Modèle User: {User}")
print(f"Table du modèle User: {User._meta.db_table}")

# Vérifier si la table existe déjà
table_name = User._meta.db_table
with connection.cursor() as cursor:
    cursor.execute(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s)",
        [table_name]
    )
    table_exists = cursor.fetchone()[0]

if table_exists:
    print(f"La table {table_name} existe déjà. Aucune action nécessaire.")
    sys.exit(0)

# La table n'existe pas, on va la créer manuellement
print(f"La table {table_name} n'existe pas. Création en cours...")

# SQL pour créer la table accounts_user minimale requise
sql = f"""
CREATE TABLE {table_name} (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE NULL,
    is_superuser BOOLEAN NOT NULL,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    is_staff BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL,
    phone VARCHAR(15) NULL,
    function VARCHAR(100) NULL,
    company VARCHAR(100) NULL
);
"""

# Créer aussi les tables de liaison pour les groupes et permissions
auth_user_groups = f"""
CREATE TABLE {table_name}_groups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES {table_name}(id),
    group_id INTEGER NOT NULL
);
"""

auth_user_permissions = f"""
CREATE TABLE {table_name}_user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES {table_name}(id),
    permission_id INTEGER NOT NULL
);
"""

# Exécuter les requêtes SQL
with connection.cursor() as cursor:
    try:
        cursor.execute(sql)
        print(f"Table {table_name} créée avec succès.")
        
        cursor.execute(auth_user_groups)
        print(f"Table {table_name}_groups créée avec succès.")
        
        cursor.execute(auth_user_permissions)
        print(f"Table {table_name}_user_permissions créée avec succès.")
        
        connection.commit()
        print("Commit réussi.")
    except Exception as e:
        print(f"Erreur lors de la création des tables: {e}")
        connection.rollback()
        sys.exit(1)

print("Création des tables terminée avec succès!") 