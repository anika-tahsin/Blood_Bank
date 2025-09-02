
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile,BloodRequest, DonationHistory
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from .models import Profile, User
from .utils import assign_user_roles, get_user_roles

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=False  # inactive until email verification
        )
        return user


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ["id", "username", "email", "is_active", "date_joined"]

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'roles', "date_joined"]
        read_only_fields = ['username', 'email']
    
    def get_roles(self, obj):
        """Get user's current roles"""
        return get_user_roles(obj)



class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.CharField(write_only=True, help_text="Email or Username")  # Keep the field name as 'email' to match frontend
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email_or_username = attrs.get("email")  # This field accepts both email and username
        password = attrs.get("password")
        
        # Add validation for empty fields
        if not email_or_username:
            raise serializers.ValidationError({"email": ["This field is required."]})
        if not password:
            raise serializers.ValidationError({"password": ["This field is required."]})
        
        # Use the custom backend to authenticate
        from django.contrib.auth import authenticate
        user = authenticate(
            request=self.context.get("request"),
            username=email_or_username,  # Backend handles email vs username
            password=password
        )
        
        if not user:
            raise serializers.ValidationError({"non_field_errors": ["Invalid credentials."]})
            
        if not user.is_active:
            raise serializers.ValidationError({"non_field_errors": ["Account not verified. Please check your email."]})
        
        # Return the tokens and user data
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        }
    


# class ProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Profile
#         fields = [
#             'id', 'full_name', 'age', 'address', 'blood_group', 
#             'last_donation_date', 'is_available_for_donation', 
#             'phone_number', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    roles = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=True,
        allow_empty=True,
        help_text="List of roles: ['donor', 'recipient']"
    )
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'full_name', 'age', 'address', 
            'phone_number', 'blood_group', 'last_donation_date', 
            'is_available_for_donation', 'created_at', 'updated_at',
            'roles'
        ]
        # read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_roles(self, value):
        """Validate that roles are valid"""
        if not value:
            return value
        
        valid_roles = ['donor', 'recipient']
        invalid_roles = [role for role in value if role not in valid_roles]
        
        if invalid_roles:
            raise serializers.ValidationError(f"Invalid roles: {invalid_roles}. Valid roles are: {valid_roles}")
        
        # if not value:  # Empty list
        #     raise serializers.ValidationError("At least one role must be selected")
        
        return value
    
    def create(self, validated_data):
        """Create profile and assign roles"""
        roles = validated_data.pop('roles', [])
        
        # Create the profile
        profile = Profile.objects.create(**validated_data)
        
        # Assign roles to the user
        assign_user_roles(profile.user, roles)
        
        return profile
    
    def update(self, instance, validated_data):
        """Update profile and roles"""
        roles = validated_data.pop('roles', None)
        
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update user roles if provided
        if roles is not None:
            assign_user_roles(instance.user, roles)
        
        return instance



class UserWithProfileSerializer(serializers.ModelSerializer):

    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'date_joined', 'profile']



class BloodRequestSerializer(serializers.ModelSerializer):
    """Serializer for BloodRequest model"""
    # requester_name = serializers.CharField(source='requester.profile.full_name', read_only=True)
    requester_name = serializers.SerializerMethodField() 
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = BloodRequest
        fields = [
            'id', 'requester', 'requester_name', 'requester_username',
            'patient_name', 'blood_group', 'units_needed', 'urgency', 
            'urgency_display', 'hospital_name', 'hospital_address', 
            'contact_phone', 'needed_by_date', 'status', 'status_display',
            'additional_notes', 'created_at', 'updated_at', 'days_remaining'
        ]
        read_only_fields = ['requester', 'created_at', 'updated_at']
    
    # Safety check
    def get_requester_name(self, obj):
        """Safely get requester name"""
        try:
            return obj.requester.profile.full_name
        except:
            return obj.requester.username 
        
    def get_days_remaining(self, obj):
        """Calculate days remaining until needed_by_date"""
        if obj.needed_by_date:
            from datetime import date, datetime
            # Convert datetime to date if necessary
            needed_date = obj.needed_by_date.date() if isinstance(obj.needed_by_date, datetime) else obj.needed_by_date
            delta = needed_date - date.today()
            return delta.days
        return None
    
    def validate_needed_by_date(self, value):
        """Validate that needed_by_date is not in the past"""
        from datetime import date, datetime
        if value:
            # Convert datetime to date if necessary
            comparison_date = value.date() if isinstance(value, datetime) else value
            
            if comparison_date < date.today():
                raise serializers.ValidationError("Needed by date cannot be in the past")
        return value
        
    def validate_units_needed(self, value):
        """Validate units needed is reasonable"""
        if value <= 0:
            raise serializers.ValidationError("Units needed must be greater than 0")
        if value > 10:
            raise serializers.ValidationError("Units needed cannot exceed 10")
        return value

class DonationHistorySerializer(serializers.ModelSerializer):
    """Serializer for DonationHistory model"""
    donor_name = serializers.CharField(source='donor.profile.full_name', read_only=True)
    donor_username = serializers.CharField(source='donor.username', read_only=True)
    donor_blood_group = serializers.CharField(source='donor.profile.blood_group', read_only=True)
    
    recipient_name = serializers.CharField(source='recipient.profile.full_name', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    
    # Blood request details
    patient_name = serializers.CharField(source='blood_request.patient_name', read_only=True)
    hospital_name = serializers.CharField(source='blood_request.hospital_name', read_only=True)
    blood_group = serializers.CharField(source='blood_request.blood_group', read_only=True)
    urgency = serializers.CharField(source='blood_request.urgency', read_only=True)
    urgency_display = serializers.CharField(source='blood_request.get_urgency_display', read_only=True)
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = DonationHistory
        fields = [
            'id', 'donor', 'donor_name', 'donor_username', 'donor_blood_group',
            'recipient', 'recipient_name', 'recipient_username',
            'blood_request', 'patient_name', 'hospital_name', 'blood_group',
            'urgency', 'urgency_display', 'units_donated', 'donation_date',
            'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'donor', 'recipient', 'blood_request', 'created_at', 'updated_at',
            'donation_date'  # Set automatically when confirmed
        ]

class SimpleBloodRequestSerializer(serializers.ModelSerializer):
    """Simplified serializer for blood requests (for dropdowns, etc.)"""
    requester_name = serializers.CharField(source='requester.profile.full_name', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    
    class Meta:
        model = BloodRequest
        fields = [
            'id', 'patient_name', 'blood_group', 'units_needed',
            'urgency', 'urgency_display', 'requester_name',
            'needed_by_date', 'status'
        ]

class SimpleDonorSerializer(serializers.ModelSerializer):
    """Simplified serializer for donor profiles"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'full_name', 'blood_group', 
            'address', 'phone_number', 'last_donation_date',
            'is_available_for_donation'
        ]

class CreateBloodRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating blood requests with validation"""
    
    class Meta:
        model = BloodRequest
        fields = [
            'patient_name', 'blood_group', 'units_needed', 'urgency',
            'hospital_name', 'hospital_address', 'contact_phone',
            'needed_by_date', 'additional_notes'
        ]
    
    def validate(self, attrs):
        """Cross-field validation"""
        from datetime import date, timedelta
        
        # If urgency is critical, needed_by_date should be soon
        if attrs.get('urgency') == 'critical':
            needed_by = attrs.get('needed_by_date')
            if needed_by and needed_by > date.today() + timedelta(days=7):
                raise serializers.ValidationError({
                    'needed_by_date': 'Critical requests should be needed within 7 days'
                })
        
        return attrs

# Stats serializer for dashboard
class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    completed_requests = serializers.IntegerField()
    total_donations = serializers.IntegerField()
    pending_donations = serializers.IntegerField()
    completed_donations = serializers.IntegerField()
    available_donors_count = serializers.IntegerField()
    urgent_requests_count = serializers.IntegerField()
    
    recent_requests = BloodRequestSerializer(many=True, read_only=True)
    recent_donations = DonationHistorySerializer(many=True, read_only=True)