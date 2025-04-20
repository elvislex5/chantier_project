FROM python:3.12-slim

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["gunicorn", "lon.wsgi:application", "--bind", "0.0.0.0:8000"] 