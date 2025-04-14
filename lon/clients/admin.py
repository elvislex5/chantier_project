from django.contrib import admin
from .models import Client

# Register your models here.
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'company_name')
    search_fields = ('name', 'email', 'company_name')
    ordering = ('-created_at',)

admin.site.register(Client, ClientAdmin)

