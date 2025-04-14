from rest_framework import serializers
from .models import User, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone', 'function', 'company', 'is_active', 'is_staff', 'is_superuser']
        read_only_fields = ['is_active']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']