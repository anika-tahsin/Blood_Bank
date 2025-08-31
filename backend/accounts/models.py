from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

# User model extending AbstractUser
class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]  

    def __str__(self):
        return self.email
    

# User Profile model to store additional information
class Profile(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('O+', 'O+'),
        ('O-', 'O-'),
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    address = models.TextField()
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    last_donation_date = models.DateField(null=True, blank=True)
    is_available_for_donation = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        return f"{self.full_name} ({self.blood_group})"
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"




class BloodRequest(models.Model):
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_requests')
    patient_name = models.CharField(max_length=100)
    blood_group = models.CharField(max_length=3, choices=Profile.BLOOD_GROUP_CHOICES)
    units_needed = models.PositiveIntegerField(default=1)
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES)
    hospital_name = models.CharField(max_length=200)
    hospital_address = models.TextField()
    contact_phone = models.CharField(max_length=15)
    needed_by_date = models.DateTimeField()
    additional_notes = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.patient_name} needs {self.blood_group} - {self.urgency} urgency"
    
    class Meta:
        ordering = ['-urgency', '-created_at']

class DonationHistory(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations_given')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations_received')
    blood_request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name='donations')
    units_donated = models.PositiveIntegerField(default=1)
    donation_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.donor.email} → {self.recipient.email} ({self.blood_request.blood_group})"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Donation History"
        verbose_name_plural = "Donation Histories"