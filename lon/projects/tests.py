from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import date, timedelta
from decimal import Decimal

from .models import Project
from clients.models import Client
from tasks.models import Task  # Supposant que vous avez un modèle Task dans une app tasks

User = get_user_model()

class ProjectModelTest(TestCase):
    """Tests pour le modèle Project"""

    def setUp(self):
        # Créer un utilisateur pour être le manager
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
            location='Test Location',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status='NEW',
            budget=Decimal('10000.00'),
            manager=self.user
        )

    def test_project_creation(self):
        """Tester la création d'un projet"""
        self.assertEqual(self.project.name, 'Test Project')
        self.assertEqual(self.project.status, 'NEW')
        self.assertEqual(self.project.manager, self.user)
        self.assertEqual(self.project.budget, Decimal('10000.00'))
        
    def test_project_str_method(self):
        """Tester la méthode __str__ du projet"""
        self.assertEqual(str(self.project), 'Test Project')
    
    def test_project_team_members(self):
        """Tester l'ajout de membres à l'équipe du projet"""
        user2 = User.objects.create_user(
            username='teammember',
            email='team@example.com',
            password='teammember123'
        )
        
        self.project.team_members.add(user2)
        self.assertEqual(self.project.team_members.count(), 1)
        self.assertTrue(user2 in self.project.team_members.all())
    
    def test_task_statistics(self):
        """Tester la méthode task_statistics du modèle Project"""
        # Créer des tâches avec différents statuts
        Task.objects.create(
            title='Task 1',
            project=self.project,
            status='todo',
            assigned_to=self.user
        )
        Task.objects.create(
            title='Task 2',
            project=self.project,
            status='in_progress',
            assigned_to=self.user
        )
        Task.objects.create(
            title='Task 3',
            project=self.project,
            status='review',
            assigned_to=self.user
        )
        Task.objects.create(
            title='Task 4',
            project=self.project,
            status='done',
            assigned_to=self.user
        )
        
        stats = self.project.task_statistics
        self.assertEqual(stats['total'], 4)
        self.assertEqual(stats['todo'], 1)
        self.assertEqual(stats['in_progress'], 1)
        self.assertEqual(stats['review'], 1)
        self.assertEqual(stats['done'], 1)
        self.assertEqual(stats['completion_rate'], 25.0)  # 1/4 * 100
    
    def test_project_progress(self):
        """Tester la méthode progress du modèle Project"""
        # Créer des tâches avec différents statuts
        Task.objects.create(
            title='Task 1',
            project=self.project,
            status='todo',
            assigned_to=self.user
        )
        Task.objects.create(
            title='Task 2',
            project=self.project,
            status='in_progress',
            assigned_to=self.user
        )
        Task.objects.create(
            title='Task 3',
            project=self.project,
            status='done',
            assigned_to=self.user
        )
        Task.objects.create(
            title='Task 4',
            project=self.project,
            status='done',
            assigned_to=self.user
        )
        
        # Calcul attendu: (0*1 + 0.5*1 + 1*2)/4 * 100 = 62.5%
        self.assertEqual(self.project.progress, 62.5)
    
    def test_is_delayed(self):
        """Tester la méthode is_delayed du modèle Project"""
        # Créer une tâche en retard
        Task.objects.create(
            title='Delayed Task',
            project=self.project,
            status='todo',
            assigned_to=self.user,
            end_date=date.today() - timedelta(days=1)  # Date passée
        )
        
        self.assertTrue(self.project.is_delayed)
        
        # Marquer la tâche comme terminée
        task = Task.objects.get(title='Delayed Task')
        task.status = 'done'
        task.save()
        
        self.assertFalse(self.project.is_delayed)


class ProjectAPITest(APITestCase):
    """Tests pour les API liées aux projets"""
    
    def setUp(self):
        # Créer un utilisateur pour les tests
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # Créer un autre utilisateur pour tester les autorisations
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
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
            location='Test Location',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status='NEW',
            budget=Decimal('10000.00'),
            manager=self.user
        )
        
        # Configurer le client API et authentifier l'utilisateur
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # URLs - Utiliser le préfixe d'application 'projects:'
        self.projects_url = '/api/projects/'  # Utiliser l'URL absolue au lieu de reverse
        self.project_detail_url = f'/api/projects/{self.project.id}/'  # Utiliser l'URL absolue
        self.project_managed_url = f'/api/projects/managed/'  # Utiliser l'URL absolue
        self.project_update_status_url = f'/api/projects/{self.project.id}/update_status/'  # Utiliser l'URL absolue
    
    def test_get_projects_list(self):
        """Tester la récupération de la liste des projets"""
        response = self.client.get(self.projects_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Project')
    
    def test_create_project(self):
        """Tester la création d'un projet via l'API"""
        data = {
            'name': 'New Project',
            'description': 'This is a new project',
            'client': self.client_obj.id,
            'location': 'New Location',
            'start_date': date.today().isoformat(),
            'end_date': (date.today() + timedelta(days=30)).isoformat(),
            'status': 'NEW',
            'budget': '20000.00'
        }
        
        response = self.client.post(self.projects_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 2)
        
        # Vérifier que le projet créé a l'utilisateur actuel comme manager
        new_project = Project.objects.get(name='New Project')
        self.assertEqual(new_project.manager, self.user)
    
    def test_get_project_detail(self):
        """Tester la récupération des détails d'un projet"""
        response = self.client.get(self.project_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Project')
        self.assertEqual(response.data['status'], 'NEW')
    
    def test_update_project(self):
        """Tester la mise à jour d'un projet"""
        data = {
            'name': 'Updated Project',
            'status': 'IN_PROGRESS'
        }
        
        response = self.client.patch(self.project_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier que le projet a été mis à jour
        self.project.refresh_from_db()
        self.assertEqual(self.project.name, 'Updated Project')
        self.assertEqual(self.project.status, 'IN_PROGRESS')
    
    def test_update_project_status(self):
        """Tester l'endpoint spécial update_status"""
        data = {'status': 'SIGNED'}
        
        response = self.client.patch(self.project_update_status_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier que le statut a été mis à jour
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, 'SIGNED')
    
    def test_update_project_status_invalid(self):
        """Tester l'endpoint update_status avec un statut invalide"""
        data = {'status': 'INVALID_STATUS'}
        
        response = self.client.patch(self.project_update_status_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que le statut n'a pas changé
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, 'NEW')
    
    def test_get_managed_projects(self):
        """Tester l'endpoint pour obtenir les projets gérés"""
        # Créer un projet géré par un autre utilisateur
        Project.objects.create(
            name='Other Project',
            manager=self.user2,
            budget=Decimal('5000.00')
        )
        
        response = self.client.get(self.project_managed_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Seulement un projet est géré par l'utilisateur de test
        self.assertEqual(response.data[0]['name'], 'Test Project')
    
    def test_unauthorized_access(self):
        """Tester que les utilisateurs non authentifiés n'ont pas accès"""
        # Déconnecter l'utilisateur
        self.client.force_authenticate(user=None)
        
        response = self.client.get(self.projects_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get(self.project_detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
