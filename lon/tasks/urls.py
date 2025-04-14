from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('calendar/', views.get_calendar_tasks, name='calendar-tasks'),
    path('debug/', views.debug_tasks, name='debug-tasks'),
]