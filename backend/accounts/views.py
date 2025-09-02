from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, permissions, viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile
from .serializers import UserRegisterSerializer, UserSerializer, ProfileSerializer
from django.shortcuts import redirect
from accounts.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer,BloodRequestSerializer, DonationHistorySerializer
from .models import User, Profile, BloodRequest, DonationHistory
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import Group
from django.db.models import Q
from datetime import date, timedelta
from .utils import get_user_roles



User = get_user_model()



class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate token + uid
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Build verification URL (one correct way)

            FRONTEND_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            verification_link = f"{FRONTEND_URL}/verify/{uid}/{token}"
                        


            # Send email
            send_mail(
                subject="Verify your Blood Bank account",
                message=f"Hi {user.username},\n\nClick the link below to verify your account:\n{verification_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response(
                {"message": "User registered. Please check your email to verify your account."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            # ✅ Return JSON response instead of redirect
            return Response({"success": True, "message": "Email verified successfully"}, 
                          status=status.HTTP_200_OK)
        else:
            # ✅ Return JSON error instead of redirect  
            return Response({"success": False, "message": "Invalid verification link"}, 
                          status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


# Custom Token Obtain Pair View to handle email/username login
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user's profile"""
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response(
                {"message": "Profile not found. Please create your profile."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request):
        """Create user profile"""
        try:
            # Check if profile already exists
            if hasattr(request.user, 'profile'):
                return Response(
                    {"message": "Profile already exists. Use PUT to update."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"message": "Error creating profile."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """Update user profile"""
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return Response(
                {"message": "Profile not found. Please create your profile first."},
                status=status.HTTP_404_NOT_FOUND
            )
        



class BloodRequestViewSet(ModelViewSet):
    """
    ViewSet for managing blood requests
    """
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on user role and query params"""
        user = self.request.user
        queryset = BloodRequest.objects.all()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by blood group if provided
        blood_group = self.request.query_params.get('blood_group', None)
        if blood_group:
            queryset = queryset.filter(blood_group=blood_group)
            
        # Filter by urgency if provided
        urgency = self.request.query_params.get('urgency', None)
        if urgency:
            queryset = queryset.filter(urgency=urgency)
        
        # If user is requesting their own requests
        my_requests = self.request.query_params.get('my_requests', None)
        if my_requests:
            queryset = queryset.filter(requester=user)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Set requester to current user when creating"""
        serializer.save(requester=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept_request(self, request, pk=None):
        """Accept a blood donation request"""
        blood_request = self.get_object()
        user = request.user
        
        # Check if user is a donor
        if not user.groups.filter(name='Donor').exists():
            return Response(
                {
                    'error': 'You need to be a blood donor to accept requests',
                    'message': 'Please update your profile and select "Blood Donor" role to accept blood requests.',
                    'action_required': 'update_profile'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user has a profile and is available
        try:
            profile = user.profile
            if not profile.is_available_for_donation:
                return Response(
                    {'error': 'You can only donate once every 56 days'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Please complete your profile first'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if request is still pending
        if blood_request.status != 'pending':
            return Response(
                {'error': 'This request is no longer available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create donation history entry
        donation_history = DonationHistory.objects.create(
            donor=user,
            recipient=blood_request.requester,
            blood_request=blood_request,
            units_donated=blood_request.units_needed,
            status='pending'
        )
        
        # Update blood request status
        blood_request.status = 'accepted'
        blood_request.save()
        
        return Response({
            'message': 'Blood request accepted successfully',
            'donation_id': donation_history.id
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def cancel_request(self, request, pk=None):
        """Cancel a blood request (only by requester)"""
        blood_request = self.get_object()
        
        if blood_request.requester != request.user:
            return Response(
                {'error': 'You can only cancel your own requests'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if blood_request.status == 'completed':
            return Response(
                {'error': 'Cannot cancel completed requests'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        blood_request.status = 'canceled'
        blood_request.save()
        
        # Cancel related donation histories
        DonationHistory.objects.filter(
            blood_request=blood_request,
            status='pending'
        ).update(status='canceled')
        
        return Response({'message': 'Request canceled successfully'})

class DonationHistoryViewSet(ModelViewSet):
    """
    ViewSet for managing donation history
    """
    serializer_class = DonationHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch']  # No delete allowed
    
    def get_queryset(self):
        """Filter donation history for current user"""
        user = self.request.user
        queryset = DonationHistory.objects.filter(
            Q(donor=user) | Q(recipient=user)
        ).select_related('donor', 'recipient', 'blood_request')
        
        # Filter by role
        role = self.request.query_params.get('role', None)
        if role == 'donor':
            queryset = queryset.filter(donor=user)
        elif role == 'recipient':
            queryset = queryset.filter(recipient=user)
            
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def confirm_donation(self, request, pk=None):
        """Confirm a donation (by recipient)"""
        donation = self.get_object()
        
        if donation.recipient != request.user:
            return Response(
                {'error': 'Only the recipient can confirm donations'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if donation.status != 'pending':
            return Response(
                {'error': 'This donation cannot be confirmed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        donation.status = 'confirmed'
        donation.donation_date = date.today()
        donation.save()
        
        # Update blood request status
        donation.blood_request.status = 'completed'
        donation.blood_request.save()
        
        # Update donor's last donation date and availability
        donor_profile = donation.donor.profile
        donor_profile.last_donation_date = date.today()
        donor_profile.is_available_for_donation = False  # Will be available after 56 days
        donor_profile.save()
        
        return Response({'message': 'Donation confirmed successfully'})
    
    @action(detail=True, methods=['post'])
    def cancel_donation(self, request, pk=None):
        """Cancel a donation"""
        donation = self.get_object()
        
        # Only donor or recipient can cancel
        if donation.donor != request.user and donation.recipient != request.user:
            return Response(
                {'error': 'You cannot cancel this donation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if donation.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'This donation cannot be canceled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        donation.status = 'canceled'
        donation.save()
        
        # Reset blood request to pending if no other accepted donations
        other_donations = DonationHistory.objects.filter(
            blood_request=donation.blood_request,
            status__in=['pending', 'confirmed']
        ).exclude(id=donation.id)
        
        if not other_donations.exists():
            donation.blood_request.status = 'pending'
            donation.blood_request.save()
        
        return Response({'message': 'Donation canceled successfully'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the current user"""
    user = request.user
    
    stats = {
        'total_requests': 0,
        'pending_requests': 0,
        'completed_requests': 0,
        'total_donations': 0,
        'pending_donations': 0,
        'completed_donations': 0,
        'available_donors_count': 0,
        'urgent_requests_count': 0
    }
    
    # User's blood requests statistics
    user_requests = BloodRequest.objects.filter(requester=user)
    stats['total_requests'] = user_requests.count()
    stats['pending_requests'] = user_requests.filter(status='pending').count()
    stats['completed_requests'] = user_requests.filter(status='completed').count()
    
    # User's donations statistics
    user_donations = DonationHistory.objects.filter(donor=user)
    stats['total_donations'] = user_donations.count()
    stats['pending_donations'] = user_donations.filter(status='pending').count()
    stats['completed_donations'] = user_donations.filter(status='confirmed').count()
    
    # Global statistics (for context)
    stats['available_donors_count'] = Profile.objects.filter(is_available_for_donation=True).count()
    stats['urgent_requests_count'] = BloodRequest.objects.filter(
        status='pending',
        urgency__in=['high', 'critical']
    ).count()
    
    # Recent activity
    recent_requests = BloodRequestSerializer(
        BloodRequest.objects.filter(status='pending').order_by('-created_at')[:5],
        many=True
    ).data
    
    recent_donations = DonationHistorySerializer(
        DonationHistory.objects.filter(
            Q(donor=user) | Q(recipient=user)
        ).order_by('-created_at')[:5],
        many=True
    ).data
    
    return Response({
        'stats': stats,
        'recent_requests': recent_requests,
        'recent_donations': recent_donations
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def available_donors(request):
    """Get list of available donors (public endpoint)"""
    blood_group = request.query_params.get('blood_group', None)
    location = request.query_params.get('location', None)
    
    # Base queryset - available donors
    queryset = Profile.objects.filter(is_available_for_donation=True)
    
    # Filter by blood group
    if blood_group:
        queryset = queryset.filter(blood_group=blood_group)
    
    # Filter by location (contains search)
    if location:
        queryset = queryset.filter(address__icontains=location)
    
    # Select related user and limit fields for privacy
    donors = queryset.select_related('user').values(
        'id',
        'full_name',
        'blood_group',
        'address',
        'user__username',
        'last_donation_date'
    )
    
    return Response({'donors': list(donors)})