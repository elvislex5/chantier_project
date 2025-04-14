from rest_framework import serializers
from .models import Project
from accounts.serializers import UserSerializer
from clients.serializers import ClientSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProjectSerializer(serializers.ModelSerializer):
    manager = UserSerializer(read_only=True)
    team_members = UserSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    task_statistics = serializers.ReadOnlyField()
    progress = serializers.ReadOnlyField()
    is_delayed = serializers.ReadOnlyField()
    client_name = serializers.SerializerMethodField()
    client_details = ClientSerializer(source='client', read_only=True)
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'location', 'start_date', 'end_date',
            'status', 'status_display', 'budget', 'manager', 'team_members',
            'created_at', 'updated_at', 'task_statistics', 'progress', 'is_delayed',
            'client', 'client_name', 'client_details', 'manager_name'
        ]

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None
        
    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}".strip() or obj.manager.username
        return None

class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'name', 'description', 'client', 'location', 'start_date', 'end_date',
            'status', 'budget', 'team_members'
        ]
        read_only_fields = ['manager']  # Le manager sera défini dans perform_create