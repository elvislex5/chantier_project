from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import date, timedelta, datetime
from decimal import Decimal

from .models import Task, TaskDocument
from projects.models import Project
from clients.models import Client
import tempfile
import os

User = get_user_model()

class TaskModelTest(TestCase):
    """Tests pour le modèle Task"""

    def setUp(self):
        # Créer un utilisateur pour être le manager et l'assigné
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # Créer un client
        self.client_obj = Client.objects.create(
            name='Test Client',
            email='client@example.com'
        )
        
        # Créer un projet
        self.project = Project.objects.create(
            name='Test Project',
            description='A test project description',
            client=self.client_obj,
            status='NEW',
            budget=Decimal('10000.00'),
            manager=self.user
        )
        
        # Créer une tâche
        self.task = Task.objects.create(
            title='Test Task',
            description='Test task description',
            project=self.project,
            created_by=self.user,
            assigned_to=self.user,
            status='todo',
            priority='medium',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7)
        )

    def test_task_creation(self):
        """Tester la création d'une tâche"""
        self.assertEqual(self.task.title, 'Test Task')
        self.assertEqual(self.task.status, 'todo')
        self.assertEqual(self.task.priority, 'medium')
        self.assertEqual(self.task.created_by, self.user)
        self.assertEqual(self.task.assigned_to, self.user)
        self.assertEqual(self.task.project, self.project)
    
    def test_task_str_method(self):
        """Tester la méthode __str__ de la tâche"""
        self.assertEqual(str(self.task), 'Test Task - Test Project')
    
    def test_duration_days(self):
        """Tester la propriété duration_days"""
        # La durée devrait être de 8 jours (jour de fin inclus)
        self.assertEqual(self.task.duration_days, 8)
        
        # Modifier la date de fin pour tester une autre durée
        self.task.end_date = self.task.start_date + timedelta(days=14)
        self.task.save()
        self.assertEqual(self.task.duration_days, 15)
    
    def test_is_overdue(self):
        """Tester la propriété is_overdue"""
        # La tâche n'est pas en retard initialement
        self.assertFalse(self.task.is_overdue)
        
        # Modifier la date de fin pour rendre la tâche en retard
        self.task.end_date = date.today() - timedelta(days=1)
        self.task.save()
        self.assertTrue(self.task.is_overdue)
        
        # Marquer la tâche comme terminée, ne devrait plus être en retard
        self.task.status = 'done'
        self.task.save()
        self.assertFalse(self.task.is_overdue)
    
    def test_delay_days(self):
        """Tester la propriété delay_days"""
        # Pas de retard initialement
        self.assertEqual(self.task.delay_days, 0)
        
        # Modifier la date de fin pour créer un retard
        self.task.end_date = date.today() - timedelta(days=3)
        self.task.save()
        self.assertEqual(self.task.delay_days, 3)

    def test_delay_status(self):
        """Tester la propriété delay_status"""
        # Tâche terminée
        self.task.status = 'done'
        self.task.save()
        self.assertIsNone(self.task.delay_status)
        
        # Tâche non terminée avec une échéance future
        self.task.status = 'todo'
        self.task.end_date = date.today() + timedelta(days=2)
        self.task.save()
        # Le message exact dépend du temps restant mais devrait contenir "Plus que"
        self.assertIn("Plus que", self.task.delay_status)
        
        # Tâche en retard
        self.task.end_date = date.today() - timedelta(days=2)
        self.task.save()
        self.assertIn("En retard de", self.task.delay_status)


class TaskDocumentTest(TestCase):
    """Tests pour le modèle TaskDocument"""
    
    def setUp(self):
        # Créer un utilisateur
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # Créer un projet
        self.project = Project.objects.create(
            name='Test Project',
            manager=self.user,
            budget=Decimal('10000.00')
        )
        
        # Créer une tâche
        self.task = Task.objects.create(
            title='Test Task',
            project=self.project,
            created_by=self.user,
            assigned_to=self.user
        )
        
        # Créer un fichier temporaire pour tester le document
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as tmp:
            tmp.write(b'test content')
            self.temp_file = tmp.name
            
        # Créer un document
        self.document = TaskDocument.objects.create(
            task=self.task,
            file=self.temp_file,
            title='Test Document',
            uploaded_by=self.user
        )
            
    def tearDown(self):
        # Nettoyer les fichiers temporaires
        if os.path.exists(self.temp_file):
            os.unlink(self.temp_file)
    
    def test_document_creation(self):
        """Tester la création d'un document de tâche"""
        self.assertEqual(self.document.title, 'Test Document')
        self.assertEqual(self.document.uploaded_by, self.user)
        self.assertEqual(self.document.task, self.task)
    
    def test_document_str_method(self):
        """Tester la méthode __str__ du document"""
        self.assertEqual(str(self.document), 'Test Document')
    
    def test_document_filename(self):
        """Tester la propriété filename"""
        # Le nom de fichier dépend du chemin complet, donc on vérifie juste que ça retourne quelque chose
        self.assertIsNotNone(self.document.filename())
    
    def test_document_extension(self):
        """Tester la propriété extension"""
        self.assertEqual(self.document.extension(), 'txt')


class TaskAPITest(APITestCase):
    """Tests pour les API liées aux tâches"""
    
    def setUp(self):
        # Créer un utilisateur pour les tests
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # Créer un autre utilisateur pour tester les assignations
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpassword123'
        )
        
        # Créer un projet
        self.project = Project.objects.create(
            name='Test Project',
            manager=self.user,
            budget=Decimal('10000.00')
        )
        
        # Créer une tâche
        self.task = Task.objects.create(
            title='Test Task',
            description='Test task description',
            project=self.project,
            created_by=self.user,
            assigned_to=self.user,
            status='todo',
            priority='medium',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7)
        )
        
        # Configurer le client API et authentifier l'utilisateur
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URLs
        self.tasks_url = '/api/tasks/'
        self.task_detail_url = f'/api/tasks/{self.task.id}/'
    
    def test_get_tasks_list(self):
        """Tester la récupération de la liste des tâches"""
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Task')
    
    def test_create_task(self):
        """Tester la création d'une tâche via l'API"""
        data = {
            'title': 'New Task',
            'description': 'This is a new task',
            'project_id': self.project.id,
            'assigned_to_id': self.user2.id,
            'status': 'todo',
            'priority': 'high',
            'start_date': date.today().isoformat(),
            'end_date': (date.today() + timedelta(days=14)).isoformat()
        }
        
        response = self.client.post(self.tasks_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 2)
        
        # Vérifier que la tâche créée a les bonnes propriétés
        new_task = Task.objects.get(title='New Task')
        self.assertEqual(new_task.priority, 'high')
        self.assertEqual(new_task.assigned_to, self.user2)
        self.assertEqual(new_task.created_by, self.user)  # L'utilisateur authentifié
    
    def test_update_task(self):
        """Tester la mise à jour d'une tâche"""
        data = {
            'status': 'in_progress',
            'priority': 'high'
        }
        
        response = self.client.patch(self.task_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier que la tâche a été mise à jour
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'in_progress')
        self.assertEqual(self.task.priority, 'high')
    
    def test_delete_task(self):
        """Tester la suppression d'une tâche"""
        response = self.client.delete(self.task_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)
    
    def test_get_tasks_by_project(self):
        """Tester le filtrage des tâches par projet"""
        # Créer un deuxième projet et une tâche associée
        project2 = Project.objects.create(
            name='Second Project',
            manager=self.user,
            budget=Decimal('5000.00')
        )
        
        Task.objects.create(
            title='Task in Project 2',
            project=project2,
            created_by=self.user,
            assigned_to=self.user
        )
        
        # Tester le filtre par projet
        response = self.client.get(f"{self.tasks_url}?project={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Task')
    
    def test_unauthorized_access(self):
        """Tester que les utilisateurs non authentifiés n'ont pas accès"""
        # Déconnecter l'utilisateur
        self.client.force_authenticate(user=None)
        
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get(self.task_detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
