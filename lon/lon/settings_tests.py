"""
Django settings for tests.
"""

import os
from pathlib import Path
from datetime import timedelta

# Importer les paramètres de base
from .settings import *

# Mode debug activé pour les tests
DEBUG = False

# Configuration de la base de données pour les tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'lon_test_db',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'db',
        'PORT': '5432',
        'TEST': {
            'NAME': 'lon_test_db',  # Utiliser la même base de données au lieu d'en créer une nouvelle
        },
    }
}

# Désactiver les transactions par défaut pour éviter les problèmes avec les bases de données
TEST_NON_SERIALIZED_APPS = [
    'accounts',
    'projects',
    'tasks',
    'clients',
    'api',
]

# Surcharger la configuration des templates pour corriger l'erreur
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Mot de passe hasher plus rapide pour les tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Backend de fichiers pour les tests
DEFAULT_FILE_STORAGE = 'django.core.files.storage.InMemoryStorage'

# Backend d'email pour les tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Réduire la durée des tokens JWT pour les tests
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=15),
}

# Désactiver les middlewares non essentiels pour les tests
MIDDLEWARE = [
    middleware for middleware in MIDDLEWARE
    if middleware not in [
        'django.middleware.security.SecurityMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ]
]

# Paramètres spécifiques pour les tests
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Désactiver les transactions pour les tests API
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
}

# Configuration statique simplifiée
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage' 