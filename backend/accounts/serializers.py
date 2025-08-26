
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "date_joined"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    username_or_email = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username_or_email = attrs.get("username_or_email") 
        password = attrs.get("password")

        if not username_or_email or not password:
            raise serializers.ValidationError({"detail": "Both username/email and password are required."})
      
        # Login with username
        user = authenticate(username=username_or_email, password=password)

        # If username not found try email
        if user is None:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError({"detail": "Invalid User Credentials"})
        
        if not user.is_active:
            raise serializers.ValidationError({"detail":"User account is not active"})
        
        refresh = self.get_token(user)

        
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user":{
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            
        }

       

