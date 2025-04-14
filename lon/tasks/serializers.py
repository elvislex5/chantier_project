from rest_framework import serializers
from .models import Task, TaskDocument
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TaskDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskDocument
        fields = ['id', 'title', 'file', 'uploaded_by', 'uploaded_at']

from rest_framework import serializers
from .models import Task
from accounts.serializers import UserSerializer
from projects.serializers import ProjectSerializer

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 
            'project', 'project_id',
            'created_by', 
            'assigned_to', 'assigned_to_id',
            'status', 'status_display',
            'priority', 'priority_display',
            'start_date', 'end_date',
            'created_at', 'updated_at',
            'assigned_to_name'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        project_id = validated_data.pop('project_id')
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        validated_data['project_id'] = project_id
        if assigned_to_id:
            validated_data['assigned_to_id'] = assigned_to_id
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        project_id = validated_data.pop('project_id', instance.project_id)
        assigned_to_id = validated_data.pop('assigned_to_id', instance.assigned_to_id)
        
        validated_data['project_id'] = project_id
        if assigned_to_id:
            validated_data['assigned_to_id'] = assigned_to_id
            
        return super().update(instance, validated_data)

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            if obj.assigned_to.first_name and obj.assigned_to.last_name:
                return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}"
            return obj.assigned_to.username
        return None