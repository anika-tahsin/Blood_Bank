from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from .models import User, BloodRequest, DonationHistory

def setup_user_groups():
    """Create user groups with appropriate permissions"""
    
    # Create groups
    admin_group, created = Group.objects.get_or_create(name='Admin')
    donor_group, created = Group.objects.get_or_create(name='Donor')
    recipient_group, created = Group.objects.get_or_create(name='Recipient')
    
    # Get content types
    blood_request_ct = ContentType.objects.get_for_model(BloodRequest)
    donation_history_ct = ContentType.objects.get_for_model(DonationHistory)
    
    # Admin permissions (all permissions)
    admin_permissions = Permission.objects.all()
    admin_group.permissions.set(admin_permissions)
    
    # Donor permissions
    donor_permissions = [
        Permission.objects.get(codename='view_bloodrequest', content_type=blood_request_ct),
        Permission.objects.get(codename='add_donationhistory', content_type=donation_history_ct),
        Permission.objects.get(codename='view_donationhistory', content_type=donation_history_ct),
    ]
    donor_group.permissions.set(donor_permissions)
    
    # Recipient permissions
    recipient_permissions = [
        Permission.objects.get(codename='add_bloodrequest', content_type=blood_request_ct),
        Permission.objects.get(codename='view_bloodrequest', content_type=blood_request_ct),
        Permission.objects.get(codename='change_bloodrequest', content_type=blood_request_ct),
        Permission.objects.get(codename='view_donationhistory', content_type=donation_history_ct),
    ]
    recipient_group.permissions.set(recipient_permissions)

def assign_user_roles(user, roles):
    """Assign roles to a user. Roles can be: 'admin', 'donor', 'recipient'"""
    user.groups.clear()  # Clear existing groups
    
    role_mapping = {
        'admin': 'Admin',
        'donor': 'Donor',
        'recipient': 'Recipient',
    }
    
    for role in roles:
        if role in role_mapping:
            group = Group.objects.get(name=role_mapping[role])
            user.groups.add(group)

def get_user_roles(user):
    """Get user's current roles"""
    return [group.name.lower() for group in user.groups.all()]

def is_donor(user):
    return user.groups.filter(name='Donor').exists()

def is_recipient(user):
    return user.groups.filter(name='Recipient').exists()

def is_admin(user):
    return user.groups.filter(name='Admin').exists() or user.is_superuser