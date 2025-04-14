from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint de vérification de santé qui permet de vérifier 
    que l'API est en cours d'exécution et que la connexion à la base de données fonctionne.
    """
    try:
        # Vérifier la connexion à la base de données
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = cursor.fetchone()[0] == 1
        
        return Response({
            "status": "ok",
            "database": "connected" if db_status else "disconnected"
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
