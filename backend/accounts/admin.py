
from django.contrib import admin
from .models import User, Profile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'is_active', 'date_joined']
    
@admin.register(Profile) 
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'blood_group', 'age', 'is_available_for_donation', 'last_donation_date']
    list_filter = ['blood_group', 'is_available_for_donation']
    search_fields = ['full_name', 'user__email']