from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer, ProjectCreateUpdateSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        # Si le manager n'est pas spécifié, utilisez l'utilisateur actuel
        if not serializer.validated_data.get('manager'):
            serializer.save(manager=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['GET'])
    def managed(self, request):
        """Retourne les projets gérés par l'utilisateur"""
        projects = Project.objects.filter(manager=request.user)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['PATCH'])
    def update_status(self, request, pk=None):
        """
        Endpoint spécial pour mettre à jour le statut d'un projet
        """
        project = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Project.STATUS_CHOICES):
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project.status = new_status
        project.save()
        
        return Response(ProjectSerializer(project).data)