import logging
from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from django.db.models import Q
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.all()
        
        # Filtrage par projet
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filtrage par dates
        start_date_after = self.request.query_params.get('start_date_after', None)
        if start_date_after:
            queryset = queryset.filter(start_date__gte=start_date_after)
        
        end_date_before = self.request.query_params.get('end_date_before', None)
        if end_date_before:
            queryset = queryset.filter(end_date__lte=end_date_before)
        
        # Ajouter cette ligne pour déboguer
        print(f"Requête SQL: {queryset.query}")
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Task.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
            
        task.status = new_status
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['GET'], url_path='project/(?P<project_id>[^/.]+)')
    def by_project(self, request, project_id=None):
        """Endpoint pour récupérer les tâches d'un projet spécifique"""
        user = request.user
        tasks = Task.objects.filter(
            project_id=project_id
        ).filter(
            models.Q(assigned_to=user) |
            models.Q(project__team_members=user) |
            models.Q(project__manager=user)
        ).distinct()
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_calendar_tasks(request):
    """Récupère les tâches pour l'affichage dans le calendrier"""
    
    # Récupérer les paramètres de requête
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    project_id = request.query_params.get('project_id')
    
    # Valider les dates
    try:
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        else:
            # Par défaut, début du mois courant
            today = datetime.now().date()
            start_date = today.replace(day=1)
            
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            # Par défaut, fin du mois suivant
            next_month = start_date.replace(day=28) + timedelta(days=4)
            end_date = next_month.replace(day=1) - timedelta(days=1)
    except ValueError:
        return Response({"error": "Format de date invalide. Utilisez YYYY-MM-DD."}, status=400)
    
    # Construire la requête
    query = Q(start_date__lte=end_date) & (
        Q(end_date__gte=start_date) | Q(end_date__isnull=True)
    )
    
    # Filtrer par projet si spécifié
    if project_id:
        query &= Q(project_id=project_id)
    
    # Récupérer les tâches
    tasks = Task.objects.filter(query).select_related('project', 'assigned_to')
    
    # Sérialiser les résultats
    serializer = TaskSerializer(tasks, many=True)
    
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_tasks(request):
    """Endpoint de débogage pour voir toutes les tâches avec leurs dates"""
    tasks = Task.objects.all()
    data = [{
        'id': task.id,
        'title': task.title,
        'start_date': task.start_date,
        'end_date': task.end_date,
        'status': task.status,
        'project_id': task.project_id if task.project else None
    } for task in tasks]
    return Response(data)